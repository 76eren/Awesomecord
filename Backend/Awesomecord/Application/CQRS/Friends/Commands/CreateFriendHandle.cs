using Application.Common.Exceptions;
using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Notifications;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class CreateFriendHandle(AppDbContext db, IMapper mapper, INotificationsPublisher notifier)
    : IRequestHandler<CreateFriendRequestCommand, FriendRequestDto>
{
    public async Task<FriendRequestDto> Handle(CreateFriendRequestCommand request, CancellationToken cancellationToken)
    {
        var sender = await db.Users.FirstOrDefaultAsync(u => u.UserHandle == request.SenderHandle, cancellationToken);
        var receiver =
            await db.Users.FirstOrDefaultAsync(u => u.UserHandle == request.ReceiverHandle, cancellationToken);

        if (sender is null || receiver is null) throw new ArgumentException("Sender or receiver not found.");

        var existingRequest = await db.FriendRequests.FirstOrDefaultAsync(fr =>
            fr.RequesterId == sender.Id && fr.RecipientId == receiver.Id, cancellationToken);
        if (existingRequest is not null) throw new FriendRequestAlreadyExistsException();

        // Check if already friends, one way is enough since friendship is mutual
        var friendsOfSender = sender.Friends;
        if (friendsOfSender.Any(f => f.FriendId == receiver.Id)) throw new AlreadyFriendsException();

        var friendRequest = FriendRequest.Create(sender.Id, receiver.Id);
        db.Set<FriendRequest>().Add(friendRequest);

        await db.SaveChangesAsync(cancellationToken);

        var freshRecipient = await db.Users.FirstAsync(u => u.Id == receiver.Id, cancellationToken);

        var updatedRecipientDto = UserFlatDto.FromUser(freshRecipient);

        var payload = new FriendRequestReceivedPayload<UserFlatDto>
        {
            RequesterHandle = sender.UserHandle,
            RecipientHandle = receiver.UserHandle,
            UpdatedUserModel = updatedRecipientDto
        };

        await notifier.FriendRequestReceivedAsync(receiver.Id, payload, cancellationToken);

        return new FriendRequestDto(request.SenderHandle, request.ReceiverHandle);
    }
}