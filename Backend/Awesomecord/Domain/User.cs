namespace Domain;

public class User
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string DisplayName { get; private set; } = default!;
    public string UserHandle { get; private set; } = default!; // This is the @username, and must be unique
    public string Bio { get; private set; } = default!;
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string Phone { get; private set; } = default!;
    public string PasswordHash { get; set; } = default!;
    
    public List<Friendship> Friends { get; private set; } = new();
    
    public List<FriendRequest> SentFriendRequests { get; private set; } = new();
    public List<FriendRequest> ReceivedFriendRequests { get; private set; } = new();
    
    // Todo: add logic for profile pictures
    // ...
    
    public User() { }
    
    public static User Create(
        string displayName, 
        string userHandle, 
        string bio,
        string firstName, 
        string lastName, 
        string email, 
        string phone,
        string passwordHash
        )
    {
        return new User
        {
            DisplayName  = displayName,
            UserHandle   = userHandle,
            Bio          = bio,
            FirstName    = firstName,
            LastName     = lastName,
            Email        = email,
            Phone        = phone,
            PasswordHash = passwordHash
        };
    }
}