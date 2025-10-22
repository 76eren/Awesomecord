using Application.DTOs;
using Application.DTOs.Notifications;

namespace Application.Notifications;

public interface IUserUpdatePublisher
{
    Task UserUpdatedAsync(
        string recipientUserId,
        FriendRequestReceivedPayload<UserFlatDto> payload,
        CancellationToken ct = default);
}