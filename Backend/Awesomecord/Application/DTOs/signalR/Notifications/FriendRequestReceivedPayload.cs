namespace Application.DTOs.Notifications;

public class FriendRequestReceivedPayload<TUserModel>
{
    public required TUserModel UpdatedUserModel { get; init; }
}