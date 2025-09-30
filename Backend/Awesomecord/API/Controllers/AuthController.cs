using System.Security.Claims;
using API.Contracts;
using API.Contracts.Login;
using API.Services;
using Application.Common.Exceptions;
using Application.Users.Commands;
using Application.Users.DTOs;
using Application.Users.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class AuthController : BaseApiController
{
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IOptions<JwtOptions> _jwtOptions;
    private readonly AppDbContext _db;
    
    public AuthController(ITokenService tokenService,
        IRefreshTokenService refreshTokenService,
        IOptions<JwtOptions> jwtOptions,
        AppDbContext db)
    {
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _jwtOptions = jwtOptions;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<ActionResult<GetUserResponseNoSensitiveDataResponse>> Login([FromBody] LoginRequestContract requestContract, CancellationToken ct)
    {
        try
        {
            var userDto = await Mediator.Send(
                new LoginRequest.LoginUserQuery(requestContract.HandleOrEmail, requestContract.Password), ct);

            var user = await _db.Users.FindAsync(new object?[] { userDto.Id }, ct);
            if (user is null) return Unauthorized();

            var access = _tokenService.CreateAccessToken(user);
            CookieWriter.SetAccessToken(Response, access, TimeSpan.FromMinutes(_jwtOptions.Value.AccessTokenMinutes));

            var (opaque, row) = await _refreshTokenService.IssueAsync(user.Id, ct);
            CookieWriter.SetRefreshToken(Response, opaque, row.ExpiresAtUtc);

            var responseContract = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(userDto);
            return Ok(responseContract);
        }
        catch (InvalidCredentialsException)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid credentials",
                Detail = "The handle/email or password is incorrect.",
                Status = StatusCodes.Status401Unauthorized
            });
        }
    }
    
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        if (Request.Cookies.TryGetValue("refresh_token", out var opaque) && !string.IsNullOrEmpty(opaque))
        {
            try
            {
                var (_, current) = await _refreshTokenService.ValidateAsync(opaque, ct);
                await _refreshTokenService.RevokeAsync(current, ct);
            }
            catch (InvalidRefreshTokenException) {  }
        }

        CookieWriter.Clear(Response);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<GetAllDataUserResponseContract>> Me(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        
        var user = await _db.Users
            .Include(u => u.Friends)
                .ThenInclude(f => f.Friend)
            .Include(u => u.SentFriendRequests)
                .ThenInclude(fr => fr.Recipient)
            .Include(u => u.ReceivedFriendRequests)
                .ThenInclude(fr => fr.Requester)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        
        if (user is null)
        {
            return Unauthorized();
        }
        
        var dto = Mapper.Map<UserDto>(user);
        var contract = Mapper.Map<GetAllDataUserResponseContract>(dto);
        
        // automapper fails to map the lists so we do it manually here
        // The friends, incoming and outgoing all only contain user handles
        contract.friends = user.Friends
            .Select(f => f.Friend.UserHandle)
            .ToList();

        contract.sentFriendRequests = user.SentFriendRequests
            .Select(r => r.Recipient.UserHandle)
            .ToList();

        contract.receivedFriendRequests = user.ReceivedFriendRequests
            .Select(r => r.Requester.UserHandle)
            .ToList();
        
        return Ok(contract);
    }
    
    
    [HttpPost]
    public async Task<ActionResult<GetUserResponseNoSensitiveDataResponse>> Register([FromBody] CreateUserRequestContract requestContract, CancellationToken ct)
    {
        var command = new CreateUserCommand(
            requestContract.DisplayName, 
            requestContract.UserHandle, 
            requestContract.Bio,
            requestContract.FirstName, 
            requestContract.LastName, 
            requestContract.Email, 
            requestContract.Phone, 
            requestContract.PasswordHash
            );

        try
        {
            UserDto result = await Mediator.Send(command, ct);
            GetUserResponseNoSensitiveDataResponse responseContract = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(result);
            return Ok(responseContract);
        }
        catch (HandleAlreadyTakenException _)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Handle already taken",
                Detail = "The user handle is already taken. Please choose a different one.",
                Status = StatusCodes.Status409Conflict
            });
        } 
    }
    
    // When 401 due to expired access call via frontend to get a new one
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out var opaque) || string.IsNullOrEmpty(opaque))
            return Unauthorized();

        try
        {
            var (user, current) = await _refreshTokenService.ValidateAsync(opaque, ct);

            var (newOpaque, newRow) = await _refreshTokenService.RotateAsync(current, ct);

            var access = _tokenService.CreateAccessToken(user);
            CookieWriter.SetAccessToken(Response, access, TimeSpan.FromMinutes(_jwtOptions.Value.AccessTokenMinutes));
            CookieWriter.SetRefreshToken(Response, newOpaque, newRow.ExpiresAtUtc);

            return NoContent();
        }
        catch (InvalidRefreshTokenException)
        {
            CookieWriter.Clear(Response);
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid refresh token",
                Detail = "Please login again.",
                Status = StatusCodes.Status401Unauthorized
            });
        }
    }
}