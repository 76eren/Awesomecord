using MediatR;

namespace Application.CQRS.Conversations.Command;

public sealed record CreateConversationCommand(
    string InitiatorUserId,
    IReadOnlyCollection<string> ParticipantUserIds,
    string title) : IRequest<Unit>;