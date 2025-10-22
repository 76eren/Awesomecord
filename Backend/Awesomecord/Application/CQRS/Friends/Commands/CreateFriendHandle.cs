using Application.Common.Exceptions;
using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Notifications;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class CreateFriendHandle(AppDbContext db, INotificationsPublisher notifier)
    : IRequestHandler<CreateFriendRequestCommand, FriendRequestDto>
{
    public async Task<FriendRequestDto> Handle(CreateFriendRequestCommand request, CancellationToken ct)
    {
        var sender = await db.Users.SingleOrDefaultAsync(u => u.UserHandle == request.SenderHandle, ct);
        var receiver = await db.Users.SingleOrDefaultAsync(u => u.UserHandle == request.ReceiverHandle, ct);
        if (sender is null || receiver is null)
            throw new ArgumentException("Sender or receiver not found.");

        var alreadyFriends = await db.Set<Friendship>().AnyAsync(f =>
            (f.UserId == sender.Id && f.FriendId == receiver.Id) ||
            (f.UserId == receiver.Id && f.FriendId == sender.Id), ct);
        if (alreadyFriends)
            throw new AlreadyFriendsException();

        var friendRequests = db.Set<FriendRequest>();

        var forwardReq = await friendRequests
            .SingleOrDefaultAsync(fr => fr.RequesterId == sender.Id && fr.RecipientId == receiver.Id, ct);
        var reverseReq = await friendRequests
            .SingleOrDefaultAsync(fr => fr.RequesterId == receiver.Id && fr.RecipientId == sender.Id, ct);

        if (forwardReq is not null && reverseReq is null)
            throw new FriendRequestAlreadyExistsException();

        if (reverseReq is not null)
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            try
            {
                await EnsureFriendshipAsync(sender.Id, receiver.Id, ct);

                if (forwardReq is not null) db.Remove(forwardReq);
                db.Remove(reverseReq);

                await db.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);

                await NotifyFriendRequestAsync(sender.Id, ct);
                await NotifyFriendRequestAsync(receiver.Id, ct);
            }
            catch
            {
                await tx.RollbackAsync(ct);
                throw;
            }

            return new FriendRequestDto(request.SenderHandle, request.ReceiverHandle);
        }

        var newReq = FriendRequest.Create(sender.Id, receiver.Id);
        db.Add(newReq);
        await db.SaveChangesAsync(ct);

        await NotifyFriendRequestAsync(receiver.Id, ct);
        await NotifyFriendRequestAsync(sender.Id, ct);

        return new FriendRequestDto(request.SenderHandle, request.ReceiverHandle);
    }

    private async Task EnsureFriendshipAsync(string aId, string bId, CancellationToken ct)
    {
        var alreadyAB = await db.Set<Friendship>().AnyAsync(f => f.UserId == aId && f.FriendId == bId, ct);
        var alreadyBA = await db.Set<Friendship>().AnyAsync(f => f.UserId == bId && f.FriendId == aId, ct);

        if (!alreadyAB) db.Set<Friendship>().Add(Friendship.Create(aId, bId));
        if (!alreadyBA) db.Set<Friendship>().Add(Friendship.Create(bId, aId));
    }

    private async Task NotifyFriendRequestAsync(string recipientUserId, CancellationToken ct)
    {
        var freshRecipient = await db.Users.FirstAsync(u => u.Id == recipientUserId, ct);
        var payload = new FriendRequestReceivedPayload<UserFlatDto>
        {
            UpdatedUserModel = UserFlatDto.FromUser(freshRecipient)
        };
        await notifier.FriendRequestReceivedAsync(recipientUserId, payload, ct);
    }
}
