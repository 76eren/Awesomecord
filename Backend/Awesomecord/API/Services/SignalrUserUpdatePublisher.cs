using API.Hubs;
using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class SignalrUserUpdatePublisher : IUserUpdatePublisher
{
    private readonly IHubContext<UpdateOwnUserHub> _hub;

    public SignalrUserUpdatePublisher(IHubContext<UpdateOwnUserHub> hub)
    {
        _hub = hub;
    }

    public Task FriendRequestReceivedAsync(
        string recipientUserId,
        FriendRequestReceivedPayload<UserFlatDto> payload,
        CancellationToken ct = default)
    {
        return _hub.Clients.User(recipientUserId)
            .SendAsync("UserUpdate", payload, ct);
    }
}