using Application.DTOs;
using MediatR;

namespace Application.CQRS.Friends.Commands;

public sealed record CreateFriendRequestCommand
(
    string SenderHandle,
    string ReceiverHandle
) : IRequest<FriendRequestDto>;