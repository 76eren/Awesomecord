using API.Hubs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class SignalrConversationUpdatePublisher(IHubContext<UpdateConversationsHub> hub) : IConversationUpdatePublisher
{
    public Task ConversationsUpdatedAsync(
        string userId,
        List<ConversationDto> payload,
        CancellationToken ct = default
    )
    {
        return hub.Clients.User(userId)
            .SendAsync("ConversationsUpdate", payload, ct);
    }
}