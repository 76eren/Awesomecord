namespace API.Contracts.User;

public class GetMultipleUsersByIdContract
{
    public List<string> users { get; init; } = default!;
}