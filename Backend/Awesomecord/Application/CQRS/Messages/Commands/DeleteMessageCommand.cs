using MediatR;

namespace Application.CQRS.Messages.Commands;

public sealed record DeleteMessageCommand(
    string MessageId,
    string RequesterId
) : IRequest<Unit>;