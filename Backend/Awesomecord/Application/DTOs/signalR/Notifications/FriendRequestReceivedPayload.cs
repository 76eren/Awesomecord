namespace Application.DTOs.Notifications;

public class FriendRequestReceivedPayload<TUserModel>
{
    public required string RequesterHandle { get; init; }
    public required string RecipientHandle { get; init; }
    public required TUserModel UpdatedUserModel { get; init; }
}