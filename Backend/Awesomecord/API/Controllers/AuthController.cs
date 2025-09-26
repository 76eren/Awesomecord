using API.Contracts;
using Application.Common.Exceptions;
using Application.Users.Commands;
using Application.Users.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class AuthController : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<GetUserResponseContract>> Register([FromBody] CreateUserRequestContract requestContract, CancellationToken ct)
    {
        var command = new CreateUserCommand(
            requestContract.DisplayName, requestContract.UserHandle, requestContract.Bio,
            requestContract.FirstName, requestContract.LastName, requestContract.Email, requestContract.Phone);

        try
        {
            UserDto result = await Mediator.Send(command, ct);
            GetUserResponseContract responseContract = Mapper.Map<GetUserResponseContract>(result);
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
}