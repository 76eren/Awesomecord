namespace Domain;

public class Message
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string ConversationId { get; private set; } = default!;
    public string SenderId { get; private set; } = default!;
    public string Body { get; private set; } = String.Empty;

    public string AttachmentHash { get; private set; } = string.Empty;

    public DateTimeOffset SentAt { get; private set; } = DateTimeOffset.UtcNow;

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
}