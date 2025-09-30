using System.ComponentModel.DataAnnotations;

namespace Domain;

public class FriendRequest
{
    // This is only to track request, upon denial or acceptance, it will be deleted.
    
    [Key]
    public string Id { get; private set; } = Guid.NewGuid().ToString();    
    public string RequesterId { get; private set; } = default!;
    public virtual User   Requester   { get; private set; } = default!;

    public string RecipientId { get; private set; } = default!;
    public virtual User   Recipient   { get; set; } = default!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public FriendRequest() {}
    
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
        };
    }
    
}