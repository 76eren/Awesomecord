namespace Domain;

public class Conversation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string? Title { get; set; } // null for direct (1:1) conversations

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual ICollection<ConversationParticipent> Participants { get; set; } =
        new List<ConversationParticipent>();

    public virtual ICollection<Message> Messages { get; private set; } = new List<Message>();

    public static Conversation CreateDirect(string userIdA, string userIdB)
    {
        var conv = new Conversation();
        conv.Participants.Add(new ConversationParticipent { UserId = userIdA, ConversationId = conv.Id });
        conv.Participants.Add(new ConversationParticipent { UserId = userIdB, ConversationId = conv.Id });
        return conv;
    }
}