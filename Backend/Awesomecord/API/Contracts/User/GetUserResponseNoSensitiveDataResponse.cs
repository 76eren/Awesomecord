namespace API.Contracts;

public sealed class GetUserResponseNoSensitiveDataResponse
{
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default;
}