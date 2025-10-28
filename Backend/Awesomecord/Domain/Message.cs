namespace Domain;

public class Message
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string ConversationId { get; private set; } = default!;
    public string SenderId { get; private set; } = default!;
    public string Body { get; private set; } = string.Empty;

    public string AttachmentHash { get; private set; } = string.Empty;

    public DateTime SentAt { get; private set; } = DateTime.UtcNow;
    public DateTime? EditedAt { get; set; }

    public virtual Message? reactedToMessage { get; private set; } = null;
    public virtual string? reactedToMessageId { get; private set; } = null;

    public virtual Conversation Conversation { get; private set; } = default!;
    public virtual User Sender { get; private set; } = default!;

    public static Message Create(
        string conversationId,
        string senderId,
        string body,
        string hash
    )
    {
        return new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Body = body,
            AttachmentHash = hash
        };
    }

    public void Edit(string newBody)
    {
        Body = newBody ?? string.Empty;
    }
}