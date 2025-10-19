namespace API.Contracts.Friend.Create;

public class FriendRequestAcceptDenyCancelContract
{
    public string Action { get; set; } = default!; // accept, deny or cancel
}