namespace Domain;

public class Friendship
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    
    public string UserId { get; private set; } = default!;
    public virtual User User { get; private set; } = default!;

    public string FriendId { get; private set; } = default!;
    public virtual User Friend { get; private set; } = default!;

    public FriendshipStatus Status { get; private set; } = FriendshipStatus.ACCEPTED;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public Friendship()
    {
    }

    public static Friendship Create(string userId, string friendId)
    {
        if (userId == friendId)
        {
            throw new ArgumentException("Cannot befriend yourself.");
        }

        return new Friendship { UserId = userId, FriendId = friendId, Status = FriendshipStatus.ACCEPTED };
    }
}
