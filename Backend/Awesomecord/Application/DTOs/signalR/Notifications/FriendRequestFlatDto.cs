namespace Application.DTOs;

public class FriendRequestFlatDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RequesterId { get; set; } = default!;
    public string RecipientId { get; set; } = default!;
}