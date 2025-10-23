using System.Security.Claims;
using Application.Common.Exceptions;
using Application.CQRS.Images;
using Application.CQRS.Images.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ImageController : BaseApiController
{
    // Todo: make these endpoints actually REST :/. This is big stupid now

    [HttpPost("profile")]
    [RequestSizeLimit(50_000_000)]
    [Authorize]
    public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        await using var stream = file.OpenReadStream();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new UploadProfilePictureCommand(file.FileName, file.ContentType, userId, stream);

        try
        {
            var hash = await Mediator.Send(command, ct);
            return Ok(new { hash });
        }
        catch (UserNotFoundException e)
        {
            return NotFound("Please login again.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfilePicture([FromQuery] string? userId, [FromQuery] string? userHandle,
        CancellationToken ct)
    {
        var user = userId ?? userHandle;

        if (string.IsNullOrEmpty(user))
            return BadRequest("Either userId or userHandle must be provided.");

        var image = await Mediator.Send(new GetProfilePicture.Query(user), ct);

        if (image is null || image.Length == 0)
            return NotFound("Profile picture not found.");

        return File(image, "image/png");
    }

    [HttpGet("conversation/{conversationId}/image/{imageHash}")]
    [Authorize]
    public async Task<IActionResult> GetConversationImage(string conversationId, string imageHash, CancellationToken ct)
    {
        var image = await Mediator.Send(new GetConversationImage.Query(conversationId, imageHash), ct);
        if (image is null || image.Length == 0)
            return NotFound("Image not found.");

        return File(image, "image/png");
    }
}