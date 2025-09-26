using API.Contracts;
using Application.Users.Commands;
using Application.Users.DTOs;
using Application.Users.Queries;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public sealed class UserController(IMediator mediator, IMapper mapper) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<GetUserResponseContract>> Create([FromBody] CreateUserRequestContract requestContract, CancellationToken ct)
    {
        var command = new CreateUserCommand(
            requestContract.DisplayName, requestContract.UserHandle, requestContract.Bio,
            requestContract.FirstName, requestContract.LastName, requestContract.Email, requestContract.Phone);

        UserDto result = await mediator.Send(command, ct);

        GetUserResponseContract responseContract = mapper.Map<GetUserResponseContract>(result);

        return CreatedAtAction(nameof(GetById), new { id = responseContract.Id }, responseContract);
    }

    
    [HttpGet("{id}")]
    public async Task<ActionResult<GetUserResponseContract>> GetById(string id, CancellationToken ct)
    {
        UserDto result = await mediator.Send(new GetUserById.Query { Id = id }, cancellationToken: ct);
        GetUserResponseContract responseContract = mapper.Map<GetUserResponseContract>(result);
        return Ok(responseContract);
    } 
}