using System.Security.Claims;
using Application.CQRS.Images;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ImageController : BaseApiController
{
    // Test endpoint for uploading files remove later
    [HttpPost]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        await using var stream = file.OpenReadStream();

        var url = await Mediator.Send(
            new UploadImageCommand(file.FileName, file.ContentType, stream),
            ct);

        return Ok(new { url });
    }

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
        var url = await Mediator.Send(command, ct);
        return Ok(new { url });
    }
}