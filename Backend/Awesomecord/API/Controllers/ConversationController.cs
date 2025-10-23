using System.Security.Claims;
using API.Contracts.Conversation;
using Application.CQRS.Conversations.Command;
using Application.CQRS.Conversations.Query;
using Application.CQRS.Messages.Commands;
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

    [Authorize]
    [HttpPost("{conversationId}/chat")]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult> SendMessage(string conversationId, [FromForm] string? message,
        [FromForm] IFormFile? image, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (string.IsNullOrWhiteSpace(message) && image == null)
            return BadRequest("At least a message, image or both is required.");

        
        var imageStream = image?.OpenReadStream();
        var contentType = image?.ContentType;
        var fileName = image?.FileName;

        var command = new CreateMessageCommand(conversationId, userId, message, imageStream, contentType, fileName);
        try
        {
            await Mediator.Send(command, ct);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}