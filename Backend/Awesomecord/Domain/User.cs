namespace Domain;

public class User
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();

    public string DisplayName { get; private set; } = default!;
    public string UserHandle  { get; private set; } = default!;
    public string Bio        { get; private set; }

    public string FirstName   { get; private set; } = default!;
    public string LastName    { get; private set; } = default!;
    public string Email       { get; private set; } = default!;
    public string Phone       { get; private set; } = default!;

    private User() { }
    
    public static User Create(string displayName, string userHandle, string? bio,
        string firstName, string lastName, string email, string phone)
    {
        return new User
        {
            DisplayName = displayName,
            UserHandle  = userHandle,
            Bio         = bio,
            FirstName   = firstName,
            LastName    = lastName,
            Email       = email,
            Phone       = phone
        };
    }
    
}