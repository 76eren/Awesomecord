using System.Security.Claims;
using API.Contracts.Friend.Create;
using Application.Common.Exceptions;
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

        try
        {
            await Mediator.Send(command, ct);
        }
        catch (FriendRequestAlreadyExistsException)
        {
            return BadRequestProblem("Friend request already exists", "Friend request has already been made.");
        }
        catch (AlreadyFriendsException)
        {
            return BadRequestProblem("Already friends", "Cannot send friend request to an existing friend.");
        }
        catch (CannotFriendYourselfException e)
        {
            return BadRequestProblem("Invalid friend request", e.Message);
        }
        catch (Exception)
        {
            return ServerErrorProblem("Friend request failed");
        }

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
        try
        {
            await Mediator.Send(command, ct);
        }
        catch (FriendRequestNotFoundException)
        {
            return NotFoundProblem("Friend request not found", "Friend request not found.");
        }
        catch (ArgumentOutOfRangeException)
        {
            return BadRequestProblem("Invalid action", "Action must be 'accept' or 'deny'.");
        }
        catch (Exception)
        {
            return ServerErrorProblem("Friend request handling failed");
        }

        return Ok();
    }

    [Authorize]
    [HttpDelete("{friendIdToDelete}")]
    public async Task<IActionResult> DeleteFriend(string friendIdToDelete, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem();

        var command = new DeleteFriendCommand(userId, friendIdToDelete);
        try
        {
            await Mediator.Send(command, ct);
        }
        catch (Exception)
        {
            return ServerErrorProblem("Delete friend failed", "An error occurred while deleting the friend.");
        }

        return Ok();
    }
}