using System.Security.Claims;
using API.Contracts.Conversation;
using Application.CQRS.Conversations.Command;
using Application.CQRS.Conversations.Query;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ConversationController : BaseApiController
{
    [Authorize]
    [HttpPost("user/{recipientId}")]
    public async Task<IActionResult> CreateConversation(string recipientId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var command = new CreateConversationCommand(userId, recipientId);

        try
        {
            await Mediator.Send(command);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<GetConversationContract>>> GetConversations(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await Mediator.Send(new GetConversations.Query { User = userId }, ct);
        var toReturn = Mapper.Map<List<GetConversationContract>>(result);
        return toReturn;
    }
}