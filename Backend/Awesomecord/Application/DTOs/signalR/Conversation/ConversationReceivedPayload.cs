namespace Application.DTOs.signalR;

public class ConversationReceivedPayload<TConversationModel>
{
    public required TConversationModel updatedConversationModel { get; init; }
}