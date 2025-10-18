using Application.Notifications;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Images.Queries;

public class GetProfilePicture
{
    public sealed record Query(string User) : IRequest<byte[]?>;

    public class Handler(AppDbContext context, IStorageService storage) : IRequestHandler<Query, byte[]?>
    {
        public async Task<byte[]?> Handle(Query request, CancellationToken cancellationToken)
        {
            if (request.User == "") return null;

            User? user;
            if (Guid.TryParse(request.User, out var userId))
            {
                var idString = userId.ToString();
                user = await context.Users.FirstOrDefaultAsync(u => u.Id == idString, cancellationToken);
            }
            else
            {
                user = await context.Users.FirstOrDefaultAsync(u => u.UserHandle == request.User, cancellationToken);
            }

            if (user == null) return null;

            // This means a profile picture needs to be seeded to min/io, maybe put this in the frontend instead?
            if (user.ProfilePictureHash == null)
                return await storage.DownloadAsync("users/default-profile.jpg", cancellationToken);
            
            var directory = "users/" + user.Id + "/profile-picture/";
            var files = await storage.ListFilesAsync(directory, cancellationToken);
            var fileName = files.FirstOrDefault(f => f.Contains(user.ProfilePictureHash));

            return await storage.DownloadAsync(fileName, cancellationToken);
        }
    }
}