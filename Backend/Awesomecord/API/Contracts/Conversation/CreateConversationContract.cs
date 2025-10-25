namespace API.Contracts.Conversation;

public class CreateConversationContract
{
    public List<string> userIds { get; set; } = new();
    public string title { get; set; } = "";
}