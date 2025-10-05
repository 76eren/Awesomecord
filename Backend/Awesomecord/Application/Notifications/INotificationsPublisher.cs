using Application.DTOs;
using Application.DTOs.Notifications;

namespace Application.Notifications;

public interface INotificationsPublisher
{
    Task FriendRequestReceivedAsync(
        string recipientUserId,
        FriendRequestReceivedPayload<UserDto> payload,
        CancellationToken ct = default);
}