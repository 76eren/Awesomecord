using Application.Common.Exceptions;
using Application.Notifications;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Messages.Commands;

public sealed class CreateMessageHandler(AppDbContext context, IStorageService _storage) : IRequestHandler<CreateMessageCommand, Unit>
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif" };
    
    public async Task<Unit> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        var sender = await context.Users.FirstOrDefaultAsync(u => u.Id == request.SenderId, cancellationToken);
        if (sender is null)
        {
            throw new UserNotFoundException();
        }
        
        var conversation = await context.Conversation.FindAsync(new object?[] { request.ConversationId }, cancellationToken);
        if (conversation is null)
        {
            throw new ConversationNotFoundException();
        }
        
        String attachmentHash = String.Empty;
        if (request.Attachment is not null && request.ContentType != null)
        {
            if (!Allowed.Contains(request.ContentType))
                throw new InvalidOperationException("Unsupported content type.");
            
            attachmentHash = await _storage.ComputeHashAsync(request.Attachment, cancellationToken);
            var directory = "conversations/" + request.ConversationId;
            var fileName = attachmentHash + Path.GetExtension(request.FileName);
            await _storage.UploadAsync(directory + "/" + fileName, request.Attachment, request.ContentType, cancellationToken);
        }
        
        var message = Message.Create(
            request.ConversationId,
            request.SenderId,
            request.Body ?? String.Empty,
            attachmentHash
        );
        
        
        context.Messages.Add(message);
        await context.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;
    }
}