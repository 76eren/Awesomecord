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
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem();

        if (contract?.userIds == null || contract.userIds.Count == 0)
            return BadRequestProblem("Invalid conversation request",
                "Provide the full list of participants as user IDs.");

        var command = new CreateConversationCommand(userId, contract.userIds, contract.title);

        try
        {
            await Mediator.Send(command);
            return Ok();
        }
        catch (Exception)
        {
            return ServerErrorProblem("Conversation creation failed",
                "An error occurred while creating the conversation.");
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<GetConversationContract>>> GetConversations(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem<List<GetConversationContract>>();

        var result = await Mediator.Send(new GetConversations.Query { User = userId }, ct);
        var toReturn = Mapper.Map<List<GetConversationContract>>(result);
        return Ok(toReturn);
    }

    [Authorize]
    [HttpPost("{conversationId}/chat")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> SendMessage(string conversationId, [FromForm] string? message,
        [FromForm] IFormFile? image, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return UnauthorizedProblem();

        if (string.IsNullOrWhiteSpace(message) && image == null)
            return BadRequestProblem("Invalid message", "At least a message, image or both is required.");


        var imageStream = image?.OpenReadStream();
        var contentType = image?.ContentType;
        var fileName = image?.FileName;

        var command = new CreateMessageCommand(conversationId, userId, message, imageStream, contentType, fileName);
        try
        {
            await Mediator.Send(command, ct);
            return Ok();
        }
        catch (Exception)
        {
            return ServerErrorProblem("Message send failed", "An error occurred while sending the message.");
        }
    }

    [HttpGet("{conversationId}/messages/{batch}")]
    [Authorize]
    public async Task<ActionResult<List<MessageGetContract>>> GetMessagesByConversation(string conversationId,
        int batch)
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(user)) return UnauthorizedProblem<List<MessageGetContract>>();

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
        catch (Exception)
        {
            return ServerErrorProblem<List<MessageGetContract>>("Failed to get messages",
                "An error occurred while fetching messages for the conversation.");
        }
    }
}