namespace Application.Common.Exceptions;

public class FriendRequestNotFoundException : Exception
{
    public FriendRequestNotFoundException() : base("Friend request not found.") {}


}