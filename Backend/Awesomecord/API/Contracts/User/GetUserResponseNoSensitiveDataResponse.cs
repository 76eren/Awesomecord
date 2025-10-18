namespace API.Contracts.User;

public sealed class GetUserResponseNoSensitiveDataResponse
{
    public string Id { get; init; } = default!;
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default;
}