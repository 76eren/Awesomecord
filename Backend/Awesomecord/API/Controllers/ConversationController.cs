using System.Security.Claims;
using API.Contracts.Conversation;
using API.Contracts.Message;
using Application.CQRS.Conversations.Command;
using Application.CQRS.Conversations.Query;
using Application.CQRS.Messages.Commands;
using Application.CQRS.Messages.Query;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ConversationController : BaseApiController
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationContract contract)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (contract?.userIds == null || contract.userIds.Count == 0)
            return BadRequest("Provide the full list of participants as user IDs.");

        var command = new CreateConversationCommand(userId, contract.userIds);

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
    
    [HttpGet("{conversationId}/messages/{batch}")]
    [Authorize]
    public async Task<ActionResult<List<MessageGetContract>>> GetMessagesByConversation(String conversationId, int batch)
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(user)) return Unauthorized();

        var query = new GetMessagesByConversation.Query
        {
            ConversationId = conversationId,
            UserId = user,
            Batch = batch
        };

        try
        {
            var result = await Mediator.Send(query);
            var toReturn = Mapper.Map<List<MessageGetContract>>(result);
            return toReturn;
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}