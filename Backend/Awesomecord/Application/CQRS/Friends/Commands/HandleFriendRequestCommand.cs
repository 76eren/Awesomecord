using Application.DTOs;
using MediatR;

namespace Application.CQRS.Friends.Commands;

public sealed record HandleFriendRequestCommand
(
    string UserThatIsRequesting,
    string UserThatIsAcceptingOrDenying,
    string Action
) : IRequest<FriendRequestDto>;