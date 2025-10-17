using Application.CQRS.Images;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ImageController : BaseApiController
{
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
}