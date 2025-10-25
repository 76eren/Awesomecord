using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Messages.Commands;

public sealed class DeleteMessageHandler(
    AppDbContext db,
    IMessagePublisher publisher
) : IRequestHandler<DeleteMessageCommand, Unit>
{
    public async Task<Unit> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await db.Messages
            .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken);

        if (message is null) return Unit.Value;

        if (!string.Equals(message.SenderId, request.RequesterId, StringComparison.Ordinal)) return Unit.Value;

        var conversationId = message.ConversationId;

        db.Messages.Remove(message);
        await db.SaveChangesAsync(cancellationToken);

        var participants = await db.ConversationParticipent
            .Where(p => p.ConversationId == conversationId)
            .Select(p => p.UserId)
            .ToListAsync(cancellationToken);

        foreach (var userId in participants)
            await publisher.MessageDeletedAsync(userId, request.MessageId, conversationId, cancellationToken);

        return Unit.Value;
    }
}