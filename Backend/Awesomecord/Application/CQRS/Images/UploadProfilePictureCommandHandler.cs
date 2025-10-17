using Application.Notifications;
using MediatR;

namespace Application.CQRS.Images;

public class UploadProfilePictureCommandHandler(IStorageService storage)
    : IRequestHandler<UploadProfilePictureCommand, string>
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif" };


    public async Task<string> Handle(UploadProfilePictureCommand request, CancellationToken cancellationToken)
    {
        if (request.Content == null || request.Content.Length == 0)
            throw new InvalidOperationException("Empty file.");

        if (!Allowed.Contains(request.ContentType))
            throw new InvalidOperationException("Unsupported content type.");


        var directory = "users/" + request.UserId + "/profile-picture/";
        var fileName = "profile" + Path.GetExtension(request.FileName);


        return await storage.UploadAsync(directory + fileName, request.Content, request.ContentType, cancellationToken);
    }
}