using Application.DTOs;
using MediatR;

namespace Application.CQRS.Friends.Commands;

public sealed record HandleFriendRequestCommand(
    string RequesterId,
    string RecipientId,
    string Action
) : IRequest<FriendRequestDto>;