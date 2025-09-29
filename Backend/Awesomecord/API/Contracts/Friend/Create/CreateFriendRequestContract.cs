namespace API.Contracts.Friend;

public class CreateFriendRequestContract
{
    public string senderHandle { get; init; } = default!;
    public string receiverHandle { get; init; } = default!;
}