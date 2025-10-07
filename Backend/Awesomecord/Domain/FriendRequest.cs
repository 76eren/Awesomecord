using System.ComponentModel.DataAnnotations;

namespace Domain;

public class FriendRequest
{
    // This is only to track request, upon denial or acceptance, it will be deleted.

    [Key] public string Id { get; set; } = Guid.NewGuid().ToString();

    public string RequesterId { get; set; } = default!;
    public virtual User Requester { get; set; } = default!;

    public string RecipientId { get; set; } = default!;
    public virtual User Recipient { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static FriendRequest Create(string requesterId, string recipientId)
    {
        if (requesterId == recipientId) throw new ArgumentException("Cannot send friend request to yourself.");

        return new FriendRequest
        {
            RequesterId = requesterId,
            RecipientId = recipientId
        };
    }
}