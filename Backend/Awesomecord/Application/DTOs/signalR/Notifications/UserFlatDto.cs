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

    public List<FriendshipFlatDto> Friends { get; private set; } = new();
    public List<FriendRequestFlatDto> SentFriendRequests { get; private set; } = new();
    public List<FriendRequestFlatDto> ReceivedFriendRequests { get; private set; } = new();


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
            Friends = user.Friends.Select(f => new FriendshipFlatDto
            {
                Id = f.Id,
                UserId = f.UserId,
                FriendId = f.FriendId
            }).ToList(),
            SentFriendRequests = user.SentFriendRequests.Select(fr => new FriendRequestFlatDto
            {
                Id = fr.Id,
                RequesterId = fr.RequesterId,
                RecipientId = fr.RecipientId
            }).ToList(),
            ReceivedFriendRequests = user.ReceivedFriendRequests.Select(fr => new FriendRequestFlatDto
            {
                Id = fr.Id,
                RequesterId = fr.RequesterId,
                RecipientId = fr.RecipientId
            }).ToList()
        };
    }
}