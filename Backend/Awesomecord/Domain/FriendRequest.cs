using System.ComponentModel.DataAnnotations;

namespace Domain;

public class FriendRequest
{
    [Key]
    public string Id = Guid.NewGuid().ToString();
    
    public string RequesterId { get; private set; } = default!;
    public User   Requester   { get; private set; } = default!;

    public string RecipientId { get; private set; } = default!;
    public User   Recipient   { get; private set; } = default!;
    
    public FriendshipStatus Status { get; private set; } = FriendshipStatus.PENDING;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? DecidedAt { get; private set; } = null;
    
    private FriendRequest() {}
    
    public static FriendRequest Create(string requesterId, string recipientId)
    {
        if (requesterId == recipientId)
        {
            throw new ArgumentException("Cannot send friend request to yourself.");
        }

        return new FriendRequest
        {
            RequesterId = requesterId,
            RecipientId = recipientId,
            Status      = FriendshipStatus.PENDING
        };
    }
    
}