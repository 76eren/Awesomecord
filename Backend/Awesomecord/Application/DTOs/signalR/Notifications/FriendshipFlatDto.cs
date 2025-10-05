namespace Application.DTOs;

public class FriendshipFlatDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();    
    public string UserId { get; set; } = default!;
    public string FriendId { get; set; } = default!;
}