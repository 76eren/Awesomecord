namespace Application.DTOs.Notifications;

public class UpdateReceivedPayload<TUserModel>
{
    public required TUserModel UpdatedUserModel { get; init; }
}