using Application.DTOs;

namespace Application.Interfaces;

public interface IMessagePublisher
{
    Task MessageAsync(
        string userId,
        MessageDto payload,
        CancellationToken cancellationToken
    );

    Task MessageEditedAsync(
        string userId,
        MessageDto payload,
        CancellationToken cancellationToken
    );

    Task MessageDeletedAsync(
        string userId,
        string messageId,
        string conversationId,
        CancellationToken cancellationToken
    );
}