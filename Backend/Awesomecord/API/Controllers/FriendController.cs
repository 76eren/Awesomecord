using System.Security.Claims;
using API.Contracts.Friend.Create;
using Application.Common.Exceptions;
using Application.CQRS.Friends.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class FriendController : BaseApiController
{
    private readonly AppDbContext _db;
    
    public FriendController(AppDbContext db)
    {
        _db = db;
    }
    
    
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateFriendRequest([FromBody] FriendRequestContract requestContract, CancellationToken ct)
    {
        var userHandle = User.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(userHandle))
        {
            return Unauthorized();
        }
        
        var command = new CreateFriendRequestCommand(
            userHandle,
            requestContract.ReceiverHandle);

        try
        {
            await Mediator.Send(command, ct);

        }
        catch (FriendRequestAlreadyExistsException ex)
        {
            return BadRequest("Friend request has already been made.");
        }
        
        return new OkResult();
    }
    
    [Authorize]
    [HttpPost("{userThatIsRequesting}")]
    public async Task<IActionResult> HandleFriendRequest(
        string userThatIsRequesting,
        [FromBody] FriendRequestAcceptDenyContract contract, 
        CancellationToken ct
        )
    {
        var userThatIsAcceptingOrDenying = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrEmpty(userThatIsAcceptingOrDenying))
        {
            return Unauthorized();
        }
        
        var command = new HandleFriendRequestCommand(userThatIsRequesting, userThatIsAcceptingOrDenying, contract.Action.ToLower());
        try
        {
            await Mediator.Send(command, ct);
        }
        catch (FriendRequestNotFoundException ex)
        {
            return NotFound("Friend request not found.");
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest("Action must be 'accept' or 'deny'.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while processing the request.");
        }
        
        return new OkResult();
    }
    
    
}