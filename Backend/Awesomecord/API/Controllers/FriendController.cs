using System.Security.Claims;
using API.Contracts.Friend.Create;
using Application.CQRS.Friends.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class FriendController : BaseApiController
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateFriendRequest([FromBody] FriendRequestContract requestContract,
        CancellationToken ct)
    {
        var userHandle = User.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(userHandle)) return UnauthorizedProblem();

        var command = new CreateFriendRequestCommand(
            userHandle,
            requestContract.ReceiverHandle);

        await Mediator.Send(command, ct);

        return Ok();
    }

    [Authorize]
    [HttpPost("{recipientId}")]
    public async Task<IActionResult> HandleFriendRequest(
        string recipientId,
        [FromBody] FriendRequestAcceptDenyCancelContract cancelContract,
        CancellationToken ct
    )
    {
        var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(requesterId)) return UnauthorizedProblem();

        var command = new HandleFriendRequestCommand(requesterId, recipientId,
            cancelContract.Action.ToLower());

        await Mediator.Send(command, ct);

        return Ok();
    }

    [Authorize]
    [HttpDelete("{friendIdToDelete}")]
    public async Task<IActionResult> DeleteFriend(string friendIdToDelete, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem();

        var command = new DeleteFriendCommand(userId, friendIdToDelete);
        await Mediator.Send(command, ct);

        return Ok();
    }
}