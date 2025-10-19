namespace Application.DTOs;

public class ConversationDto
{
    public string Id { get; set; } = default!;
    public string title { get; set; } = default!;
    public string created_at { get; set; } = default!;
    public List<string> participantIds { get; set; } = new();
}