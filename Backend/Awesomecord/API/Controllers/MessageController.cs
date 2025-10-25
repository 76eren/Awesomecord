using System.Security.Claims;
using Application.CQRS.Messages.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class MessageController : BaseApiController
{
    [Authorize]
    [HttpDelete("{messageId}")]
    public async Task<IActionResult> DeleteMessageById(string messageId, CancellationToken ct)
    {
        var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(requesterId)) return Unauthorized();

        var command = new DeleteMessageCommand(messageId, requesterId);
        await Mediator.Send(command, ct);
        return Ok();
    }
}