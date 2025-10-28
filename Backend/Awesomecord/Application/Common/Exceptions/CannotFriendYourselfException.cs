namespace Application.Common.Exceptions;

public class CannotFriendYourselfException() : Exception("Cannot send a friend request to yourself.")
{
}