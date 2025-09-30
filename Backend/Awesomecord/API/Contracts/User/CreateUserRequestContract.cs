namespace API.Contracts.User;

public sealed class CreateUserRequestContract
{
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Phone { get; init; } = default!;
    public string PasswordHash { get; init; } = default!;
}