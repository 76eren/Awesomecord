namespace Application.DTOs;

public class FriendRequestDto(string senderHandle, string receiverHandle)
{
    public string SenderHandle { get; set; } = senderHandle;
    public string ReceiverHandle { get; set; } = receiverHandle;
}