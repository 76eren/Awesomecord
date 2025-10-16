// Will be sent to user through signalR when they receive a notification

using Domain;

namespace Application.DTOs;

public class UserFlatDto
{
    public string Id { get; init; } = default!;
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Phone { get; init; } = default!;

    public List<string> FriendsIds { get; private set; } = new();
    public List<string> SentFriendRequests { get; private set; } = new();
    public List<string> ReceivedFriendRequests { get; private set; } = new();


    public static UserFlatDto FromUser(User user)
    {
        return new UserFlatDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            UserHandle = user.UserHandle,
            Bio = user.Bio,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            FriendsIds = user.Friends.Select(f => f.FriendId).ToList(),
            SentFriendRequests = user.SentFriendRequests.Select(r => r.RecipientId).ToList(),
            ReceivedFriendRequests = user.ReceivedFriendRequests.Select(r => r.RequesterId).ToList()
        };
    }
}