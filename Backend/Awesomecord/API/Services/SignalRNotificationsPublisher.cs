using API.Hubs;
using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class SignalRNotificationsPublisher : INotificationsPublisher
{
    private readonly IHubContext<NotificationsHub> _hub;

    public SignalRNotificationsPublisher(IHubContext<NotificationsHub> hub)
    {
        _hub = hub;
    }

    public Task FriendRequestReceivedAsync(
        string recipientUserId,
        FriendRequestReceivedPayload<UserDto> payload,
        CancellationToken ct = default)
    {
        return _hub.Clients.User(recipientUserId)
            .SendAsync("FriendRequestReceived", payload, ct);
    }
}