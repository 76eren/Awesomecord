using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Messages.Commands;

public sealed class EditMessageHandler(
    AppDbContext db,
    IMessagePublisher publisher,
    IMapper _mapper
) : IRequestHandler<EditMessageCommand, MessageDto>
{
    public async Task<MessageDto> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await db.Messages
            .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken);

        if (message is null)
        {
            throw new KeyNotFoundException("Message not found");
        }

        if (!string.Equals(message.SenderId, request.RequesterId, StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException("User is not authorized to edit this message");
        }

        message.Edit(request.NewBody);
        message.EditedAt = DateTime.UtcNow;
        
        await db.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<MessageDto>(message);

        var participants = await db.ConversationParticipent
            .Where(p => p.ConversationId == message.ConversationId)
            .Select(p => p.UserId)
            .ToListAsync(cancellationToken);

        foreach (var userId in participants)
        {
            await publisher.MessageEditedAsync(userId, dto, cancellationToken);
        }

        return dto;
    }
}

