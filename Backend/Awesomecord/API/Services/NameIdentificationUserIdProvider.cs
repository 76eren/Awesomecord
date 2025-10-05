using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class NameIdentifierUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
        => connection.User?.FindFirstValue(ClaimTypes.NameIdentifier);
}