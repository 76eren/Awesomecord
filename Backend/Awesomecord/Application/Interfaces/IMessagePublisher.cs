using Application.DTOs;

namespace Application.Interfaces;

public interface IMessagePublisher
{
    Task MessageAsync(
        string userId,
        MessageDto payload,
        CancellationToken cancellationToken
    );
}