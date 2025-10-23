using MediatR;

namespace Application.CQRS.Messages.Commands;

public sealed record CreateMessageCommand(
    string ConversationId,
    string SenderId,
    string? Body,
    
    Stream? Attachment,
    String? ContentType,
    String? FileName
) : IRequest<Unit>;