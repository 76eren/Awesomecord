namespace Application.Common.Exceptions;

public class HandleAlreadyTakenException : Exception
{
    public HandleAlreadyTakenException(string message) : base(message) { }
}