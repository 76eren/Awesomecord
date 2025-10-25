namespace Domain;

public class Conversation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string? Title { get; set; } // null for direct (1:1) conversations

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual ICollection<ConversationParticipent> Participants { get; set; } =
        new List<ConversationParticipent>();

    public virtual ICollection<Message> Messages { get; private set; } = new List<Message>();

    public static Conversation Create(string userIdA, string userIdB)
    {
        // Keep legacy overload to avoid breaking existing callers
        return Create(new[] { userIdA, userIdB });
    }

    public static Conversation Create(IEnumerable<string> participantUserIds)
    {
        var ids = participantUserIds?.Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id.Trim())
            .Distinct()
            .ToList() ?? new List<string>();

        if (ids.Count < 2)
            throw new ArgumentException("At least two participants are required to create a conversation.", nameof(participantUserIds));

        var conv = new Conversation();
        foreach (var uid in ids)
        {
            conv.Participants.Add(new ConversationParticipent { UserId = uid, ConversationId = conv.Id });
        }
        return conv;
    }
}