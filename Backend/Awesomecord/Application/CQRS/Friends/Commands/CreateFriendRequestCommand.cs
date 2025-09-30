using Application.Users.DTOs;
using MediatR;

namespace Application.Friends.Commands;

public sealed record CreateFriendRequestCommand
(
    string SenderHandle,
    string ReceiverHandle
) : IRequest<FriendRequestDto>;