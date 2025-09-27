namespace API.Contracts.Login;

public class LoginRequestContract
{
    public string HandleOrEmail { get; init; } = default!;
    public string Password { get; init; } = default!;
}