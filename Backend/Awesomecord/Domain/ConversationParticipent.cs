namespace Domain;

public class ConversationParticipent
{
    public string ConversationId { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public DateTimeOffset JoinedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Conversation Conversation { get; set; } = default!;
    public virtual User User { get; set; } = default!;
}