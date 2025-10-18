using Application.Common.Exceptions;
using Application.Notifications;
using MediatR;
using Persistence;

namespace Application.CQRS.Images;

public class UploadProfilePictureCommandHandler(IStorageService storage, AppDbContext appDbContext)
    : IRequestHandler<UploadProfilePictureCommand, string>
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif" };


    public async Task<string> Handle(UploadProfilePictureCommand request, CancellationToken cancellationToken)
    {
        var user = await appDbContext.Users.FindAsync([request.UserId], cancellationToken);
        if (user == null) throw new UserNotFoundException();

        if (request.Content == null || request.Content.Length == 0)
            throw new InvalidOperationException("Empty file.");

        if (!Allowed.Contains(request.ContentType))
            throw new InvalidOperationException("Unsupported content type.");

        var hash = await storage.ComputeHashAsync(request.Content, cancellationToken);

        var directory = "users/" + request.UserId + "/profile-picture/";
        var fileName = hash + Path.GetExtension(request.FileName);

        await storage.UploadAsync(directory + fileName, request.Content, request.ContentType, cancellationToken);


        user.ProfilePictureHash = hash;
        await appDbContext.SaveChangesAsync(cancellationToken);

        return hash;
    }
}