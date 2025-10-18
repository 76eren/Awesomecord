using MediatR;

namespace Application.CQRS.Friends.Commands;

public sealed record DeleteFriendCommand(
    string FriendId,
    string UserId
) : IRequest<Unit>;