namespace API.Contracts.Message;

public class MessageGetContract
{
    public string Id { get; set; }
    public string ConversationId { get; set; }
    public string SenderId { get; set; }
    public string Body { get; set; }
    public string AttachmentHash { get; set; }
    public DateTimeOffset SentAt { get; set; }
}