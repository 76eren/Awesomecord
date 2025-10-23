using Application.Notifications;
using MediatR;
using Persistence;

namespace Application.CQRS.Images.Queries;

public sealed class GetConversationImage
{
    public sealed record Query(string ConversationId, string ImageHash) : IRequest<byte[]?>;

    public class Handler(AppDbContext db, IStorageService storage) : IRequestHandler<Query, byte[]?>
    {
        public async Task<byte[]?> Handle(Query request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.ImageHash))
                return null;

            var directory = $"conversations/{request.ConversationId}";
            var files = await storage.ListFilesAsync(directory, cancellationToken);
            var fileName = files.FirstOrDefault(f => f.Contains(request.ImageHash));

            if (fileName == null)
                return null;

            return await storage.DownloadAsync(fileName, cancellationToken);
        }
    }
}