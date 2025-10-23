using API.Hubs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class SignalrMessageService(IHubContext<MessageHub> hub) : IMessagePublisher
{
    public Task MessageAsync(string userId, MessageDto payload, CancellationToken cancellationToken)
    {
        return hub.Clients.User(userId)
            .SendAsync("messages", payload, cancellationToken);
    }
}