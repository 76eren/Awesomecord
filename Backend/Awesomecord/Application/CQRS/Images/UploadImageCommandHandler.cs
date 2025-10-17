using Application.Notifications;
using MediatR;

namespace Application.CQRS.Images;

public sealed class UploadImageCommandHandler : IRequestHandler<UploadImageCommand, string>
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif" };

    private readonly IStorageService _storage;

    public UploadImageCommandHandler(IStorageService storage)
    {
        _storage = storage;
    }

    public async Task<string> Handle(UploadImageCommand request, CancellationToken ct)
    {
        if (request.Content == null || request.Content.Length == 0)
            throw new InvalidOperationException("Empty file.");

        if (!Allowed.Contains(request.ContentType))
            throw new InvalidOperationException("Unsupported content type.");

        var ext = Path.GetExtension(request.FileName);
        var objectName = $"{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid():N}{ext}";

        return await _storage.UploadAsync(objectName, request.Content, request.ContentType, ct);
    }
}