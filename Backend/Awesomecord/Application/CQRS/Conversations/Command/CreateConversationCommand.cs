using MediatR;

namespace Application.CQRS.Conversations.Command;

public sealed record CreateConversationCommand(string UserIdA, string UserIdB) : IRequest<Unit>;