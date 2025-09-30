using Domain;

namespace API.Contracts.User;

// Contains sensitive data, only to be used when the user requests their own data
public sealed class GetAllDataUserResponseContract
{
    public string Id { get; init; } = default!;
    public string DisplayName { get; init; } = default!;
    public string UserHandle { get; init; } = default!;
    public string Bio { get; init; } = default;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Phone { get; init; } = default!;
    
    // All lists contain only user handles
    public List<String> friends { get; set; } = new();
    public List<String> sentFriendRequests { get; set; } = new();
    public List<String> receivedFriendRequests { get; set; } = new();
}