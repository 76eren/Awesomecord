using API.Contracts.User;
using Application.CQRS.Users.Queries;
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
        // Todo: this contains no error handling, should probably return 404 if user not found
        var result = await Mediator.Send(new GetUserById.Query { Id = id }, ct);
        var responseResponseNoSensitiveDataResponse = Mapper.Map<GetUserResponseNoSensitiveDataResponse>(result);
        return Ok(responseResponseNoSensitiveDataResponse);
    }

    [HttpPost]
    public async Task<ActionResult<List<GetUserResponseNoSensitiveDataResponse>>> GetMultipleUserById(
        [FromBody] GetMultipleUsersByIdContract request, CancellationToken ct)
    {
        var results = new List<GetUserResponseNoSensitiveDataResponse>();
        foreach (var i in request.users)
            try
            {
                var result = await Mediator.Send(new GetUserById.Query { Id = i }, ct);
                var responseResponseNoSensitiveDataResponse =
                    Mapper.Map<GetUserResponseNoSensitiveDataResponse>(result);
                results.Add(responseResponseNoSensitiveDataResponse);
            }
            catch (Exception ex)
            {
            } // Ignore users that are not found

        return results;
    }
}