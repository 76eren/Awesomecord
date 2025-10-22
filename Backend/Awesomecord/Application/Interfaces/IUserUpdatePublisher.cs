using Application.DTOs;
using Application.DTOs.Notifications;

namespace Application.Notifications;

public interface IUserUpdatePublisher
{
    Task FriendRequestReceivedAsync(
        string recipientUserId,
        FriendRequestReceivedPayload<UserFlatDto> payload,
        CancellationToken ct = default);
}