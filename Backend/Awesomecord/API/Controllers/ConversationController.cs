using System.Security.Claims;
using Application.CQRS.Conversations.Command;
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
}