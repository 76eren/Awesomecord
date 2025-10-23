using Application.Common.Exceptions;
using Application.DTOs;
using Application.Interfaces;
using Application.Notifications;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Messages.Commands;

public sealed class CreateMessageHandler(
    AppDbContext context,
    IStorageService _storage,
    IMessagePublisher _messagePublisher) : IRequestHandler<CreateMessageCommand, Unit>
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif" };

    public async Task<Unit> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        var sender = await context.Users.FirstOrDefaultAsync(u => u.Id == request.SenderId, cancellationToken);
        if (sender is null) throw new UserNotFoundException();

        var conversation =
            await context.Conversation.FindAsync(new object?[] { request.ConversationId }, cancellationToken);
        if (conversation is null) throw new ConversationNotFoundException();

        var attachmentHash = string.Empty;
        if (request.Attachment is not null && request.ContentType != null)
        {
            if (!Allowed.Contains(request.ContentType))
                throw new InvalidOperationException("Unsupported content type.");

            attachmentHash = await _storage.ComputeHashAsync(request.Attachment, cancellationToken);
            var directory = "conversations/" + request.ConversationId;
            var fileName = attachmentHash + Path.GetExtension(request.FileName);
            await _storage.UploadAsync(directory + "/" + fileName, request.Attachment, request.ContentType,
                cancellationToken);
        }

        var message = Message.Create(
            request.ConversationId,
            request.SenderId,
            request.Body ?? string.Empty,
            attachmentHash
        );


        context.Messages.Add(message);
        await context.SaveChangesAsync(cancellationToken);

        await NotifyParticipantsAsync(message, cancellationToken);

        return Unit.Value;
    }

    private async Task NotifyParticipantsAsync(Message message, CancellationToken cancellationToken)
    {
        var participants = await context.ConversationParticipent
            .Where(p => p.ConversationId == message.ConversationId)
            .ToListAsync(cancellationToken);

        var messageDto = new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            Body = message.Body,
            AttachmentHash = message.AttachmentHash,
            SentAt = message.SentAt
        };

        foreach (var participant in participants)
            await _messagePublisher.MessageAsync(participant.UserId, messageDto, cancellationToken);
    }
}