namespace API.Contracts.Friend;

public class CreateFriendRequestContract
{
    public string receiverHandle { get; init; } = default!;
}