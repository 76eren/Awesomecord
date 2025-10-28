using System.Text.Json;
using API.Services;
using Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var status = StatusCodes.Status500InternalServerError;
        var title = "Server error";
        var detail = "An error occurred while processing the request.";

        switch (ex)
        {
            case UserNotFoundException _:
                status = StatusCodes.Status404NotFound;
                title = "User not found";
                detail = ex.Message ?? "The user could not be found.";
                break;
            case FriendRequestNotFoundException _:
                status = StatusCodes.Status404NotFound;
                title = "Friend request not found";
                detail = ex.Message ?? "Friend request not found.";
                break;
            case FriendRequestAlreadyExistsException _:
                status = StatusCodes.Status400BadRequest;
                title = "Friend request already exists";
                detail = ex.Message ?? "Friend request has already been made.";
                break;
            case AlreadyFriendsException _:
                status = StatusCodes.Status400BadRequest;
                title = "Already friends";
                detail = ex.Message ?? "Cannot send friend request to an existing friend.";
                break;
            case CannotFriendYourselfException _:
                status = StatusCodes.Status400BadRequest;
                title = "Invalid friend request";
                detail = ex.Message ?? "Cannot friend yourself.";
                break;
            case HandleAlreadyTakenException _:
                status = StatusCodes.Status409Conflict;
                title = "Handle already taken";
                detail = ex.Message ?? "The user handle is already taken.";
                break;
            case InvalidCredentialsException _:
                status = StatusCodes.Status401Unauthorized;
                title = "Invalid credentials";
                detail = ex.Message ?? "The handle/email or password is incorrect.";
                break;
            case InvalidRefreshTokenException _:
                status = StatusCodes.Status401Unauthorized;
                title = "Invalid refresh token";
                detail = ex.Message ?? "Please login again.";
                break;
            case ConversationNotFoundException _:
                status = StatusCodes.Status404NotFound;
                title = "Conversation not found";
                detail = ex.Message ?? "Conversation not found.";
                break;
            case KeyNotFoundException _:
                status = StatusCodes.Status404NotFound;
                title = "Not found";
                detail = ex.Message ?? "The requested resource was not found.";
                break;
            case ArgumentOutOfRangeException _:
            case ArgumentException _:
                status = StatusCodes.Status400BadRequest;
                title = "Bad request";
                detail = ex.Message ?? "The request is invalid.";
                break;
            case UnauthorizedAccessException _:
                status = StatusCodes.Status403Forbidden;
                title = "Forbidden";
                detail = ex.Message ?? "You are not allowed to perform this action.";
                break;
            case InvalidOperationException _:
                status = StatusCodes.Status400BadRequest;
                title = "Invalid operation";
                detail = ex.Message ?? "The operation is not valid.";
                break;
        }

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(ex, "An unexpected error occurred");
        else
            _logger.LogWarning(ex, "Handled exception mapped to HTTP {Status}", status);

        var problem = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = status
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = status;

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}