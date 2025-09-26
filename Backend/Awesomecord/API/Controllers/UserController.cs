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
public sealed class UserController : BaseApiController
{
    [HttpGet("{id}")]
    public async Task<ActionResult<GetUserResponseContract>> GetById(string id, CancellationToken ct)
    {
        UserDto result = await Mediator.Send(new GetUserById.Query { Id = id }, cancellationToken: ct);
        GetUserResponseContract responseContract = Mapper.Map<GetUserResponseContract>(result);
        return Ok(responseContract);
    } 
}