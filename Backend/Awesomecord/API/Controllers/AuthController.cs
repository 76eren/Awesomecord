using System.Security.Claims;
using API.Contracts.Login;
using API.Contracts.User;
using API.Services;
using Application.CQRS.Users.Commands;
using Application.CQRS.Users.Queries;
using Application.DTOs;
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
    private readonly AppDbContext _db;
    private readonly IOptions<JwtOptions> _jwtOptions;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly ITokenService _tokenService;

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
    public async Task<IActionResult> Login([FromBody] LoginRequestContract requestContract, CancellationToken ct)
    {
        var userDto = await Mediator.Send(
            new LoginRequest.LoginUserQuery(requestContract.HandleOrEmail, requestContract.Password), ct);

        var user = await _db.Users.FindAsync(new object?[] { userDto.Id }, ct);
        if (user is null)
            return UnauthorizedProblem("Invalid credentials", "The handle/email or password is incorrect.");

        var access = _tokenService.CreateAccessToken(user);
        CookieWriter.SetAccessToken(Response, access, TimeSpan.FromMinutes(_jwtOptions.Value.AccessTokenMinutes));

        var (opaque, row) = await _refreshTokenService.IssueAsync(user.Id, ct);
        CookieWriter.SetRefreshToken(Response, opaque, row.ExpiresAtUtc);

        var responseContract = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(userDto);
        return Ok(responseContract);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        if (Request.Cookies.TryGetValue("refresh_token", out var opaque) && !string.IsNullOrEmpty(opaque))
            try
            {
                var (_, current) = await _refreshTokenService.ValidateAsync(opaque, ct);
                await _refreshTokenService.RevokeAsync(current, ct);
            }
            catch (InvalidRefreshTokenException)
            {
            }

        CookieWriter.Clear(Response);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null) return UnauthorizedProblem();

        var dto = Mapper.Map<UserDto>(user);
        var contract = Mapper.Map<GetAllDataUserResponseContract>(dto);

        return Ok(contract);
    }

    [HttpGet("authenticated")]
    public IActionResult IsAuthenticated()
    {
        if (User.Identity is not { IsAuthenticated: true })
            return UnauthorizedProblem();

        return NoContent();
    }


    [HttpPost]
    public async Task<IActionResult> Register([FromBody] CreateUserRequestContract requestContract,
        CancellationToken ct)
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

        var result = await Mediator.Send(command, ct);
        var responseContract = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(result);
        return Ok(responseContract);
    }

    // When 401 due to expired access call via frontend to get a new one
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out var opaque) || string.IsNullOrEmpty(opaque))
            return UnauthorizedProblem("Missing refresh token", "Refresh token cookie is missing.");

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
            return UnauthorizedProblem("Invalid refresh token", "Please login again.");
        }
    }
}