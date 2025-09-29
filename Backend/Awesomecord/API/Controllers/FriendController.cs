using System.Security.Claims;
using API.Contracts.Friend;
using Application.Friends.Commands;
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
    public async Task<IActionResult> CreateFriendRequest([FromBody] CreateFriendRequestContract requestContract, CancellationToken ct)
    {
        var userHandle = User.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(userHandle))
        {
            return Unauthorized();
        }

        // Make sure a user can only send a friend request on their own behalf
        if (userHandle != requestContract.senderHandle)
        {
            return BadRequest();
        }
        
        var command = new CreateFriendRequestCommand(
            requestContract.senderHandle,
            requestContract.receiverHandle);

        await Mediator.Send(command, ct);
        
        return new OkResult();
    }
}