using System.Security.Claims;
using Application.Common.Exceptions;
using Application.CQRS.Images;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ImageController : BaseApiController
{
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
}