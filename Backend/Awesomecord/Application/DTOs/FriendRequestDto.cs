namespace Application.DTOs;

public class FriendRequestDto(string senderHandle, string receiverHandle)
{
    // Todo: update this to include things like status, timestamps, etc
    // Currently it doesn't matter because nothing gets returned from the controllers yet but should be done eventually
    public string SenderHandle { get; set; } = senderHandle;
    public string ReceiverHandle { get; set; } = receiverHandle;
}