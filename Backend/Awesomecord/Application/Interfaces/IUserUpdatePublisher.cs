using Application.DTOs;
using Application.DTOs.Notifications;

namespace Application.Notifications;

public interface IUserUpdatePublisher
{
    Task UserUpdatedAsync(
        string recipientUserId,
        UpdateReceivedPayload<UserFlatDto> payload,
        CancellationToken ct = default);
}