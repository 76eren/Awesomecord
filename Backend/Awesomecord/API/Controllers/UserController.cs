using API.Contracts;
using Application.Users.Commands;
using Application.Users.DTOs;
using Application.Users.Queries;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;

// Todo: might as well move this to auth controller?

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public sealed class UserController : BaseApiController
{
    
    // This endpoint is public and will be used for looking up other users by their id
    [HttpGet("{id}")]
    public async Task<ActionResult<GetUserResponseNoSensitiveDataResponse>> GetById(string id, CancellationToken ct)
    {
        UserDto result = await Mediator.Send(new GetUserById.Query { Id = id }, cancellationToken: ct);
        GetUserResponseNoSensitiveDataResponse responseResponseNoSensitiveDataResponse = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(result);
        return Ok(responseResponseNoSensitiveDataResponse);
    } 
}