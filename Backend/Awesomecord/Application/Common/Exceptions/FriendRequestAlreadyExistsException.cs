namespace Application.Common.Exceptions;

public class FriendRequestAlreadyExistsException : Exception
{
    public FriendRequestAlreadyExistsException() 
        : base("A friend request between these users already exists.")
    {
    }
}