using Domain;

namespace Application.DTOs;

public class UserDto
{
    public string Id { get; init; } = default!;
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Phone { get; init; } = default!;
    public string PasswordHash { get; init; } = default!;
    
    public List<Friendship> Friends { get; private set; } = new();
    public List<FriendRequest> SentFriendRequests { get; private set; } = new();
    public List<FriendRequest> ReceivedFriendRequests { get; private set; } = new();
}