using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BaseApiController : ControllerBase
{
    private IMapper? _mapper;
    private IMediator? _mediator;

    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>()
                                                  ?? throw new InvalidOperationException(
                                                      "IMediator service is not registered.");

    protected IMapper Mapper => _mapper ??= HttpContext.RequestServices.GetService<IMapper>()
                                            ?? throw new InvalidOperationException(
                                                "IMapper service is not registered.");

    // Helper to create a ProblemDetails response with consistent Title/Detail/Status
    protected IActionResult ProblemDetailsResponse(int statusCode, string title, string detail)
    {
        var pd = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode
        };

        return StatusCode(statusCode, pd);
    }

    protected ActionResult<T> ProblemDetailsResponse<T>(int statusCode, string title, string detail)
    {
        var pd = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode
        };

        return StatusCode(statusCode, pd);
    }

    protected IActionResult UnauthorizedProblem(string title = "Not authenticated",
        string detail = "The user is not authenticated.")
    {
        return ProblemDetailsResponse(StatusCodes.Status401Unauthorized, title, detail);
    }

    protected IActionResult BadRequestProblem(string title = "Bad request", string detail = "The request is invalid.")
    {
        return ProblemDetailsResponse(StatusCodes.Status400BadRequest, title, detail);
    }

    protected IActionResult NotFoundProblem(string title = "Not found",
        string detail = "The requested resource was not found.")
    {
        return ProblemDetailsResponse(StatusCodes.Status404NotFound, title, detail);
    }

    protected IActionResult ConflictProblem(string title = "Conflict",
        string detail = "The request could not be completed due to a conflict.")
    {
        return ProblemDetailsResponse(StatusCodes.Status409Conflict, title, detail);
    }

    protected IActionResult ServerErrorProblem(string title = "Server error",
        string detail = "An error occurred while processing the request.")
    {
        return ProblemDetailsResponse(StatusCodes.Status500InternalServerError, title, detail);
    }

    // Generic versions
    protected ActionResult<T> UnauthorizedProblem<T>(string title = "Not authenticated",
        string detail = "The user is not authenticated.")
    {
        return ProblemDetailsResponse<T>(StatusCodes.Status401Unauthorized, title, detail);
    }

    protected ActionResult<T> BadRequestProblem<T>(string title = "Bad request",
        string detail = "The request is invalid.")
    {
        return ProblemDetailsResponse<T>(StatusCodes.Status400BadRequest, title, detail);
    }

    protected ActionResult<T> NotFoundProblem<T>(string title = "Not found",
        string detail = "The requested resource was not found.")
    {
        return ProblemDetailsResponse<T>(StatusCodes.Status404NotFound, title, detail);
    }

    protected ActionResult<T> ConflictProblem<T>(string title = "Conflict",
        string detail = "The request could not be completed due to a conflict.")
    {
        return ProblemDetailsResponse<T>(StatusCodes.Status409Conflict, title, detail);
    }

    protected ActionResult<T> ServerErrorProblem<T>(string title = "Server error",
        string detail = "An error occurred while processing the request.")
    {
        return ProblemDetailsResponse<T>(StatusCodes.Status500InternalServerError, title, detail);
    }
}