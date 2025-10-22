using Application.DTOs;

namespace Application.Interfaces;

public interface IConversationUpdatePublisher
{
    Task ConversationsUpdatedAsync(
        string userId,
        List<ConversationDto> payload,
        CancellationToken ct = default);
}