using Application.Common.Exceptions;
using Application.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class HandleFriendRequestHandler(AppDbContext db, IMapper mapper)
    : IRequestHandler<HandleFriendRequestCommand, FriendRequestDto>
{
    public async Task<FriendRequestDto> Handle(HandleFriendRequestCommand request, CancellationToken ct)
    {
        var userThatIsAcceptingOrDenying =
            await db.Users.SingleOrDefaultAsync(u => u.Id == request.UserThatIsAcceptingOrDenying, ct);
        var userThatIsRequesting =
            await db.Users.SingleOrDefaultAsync(u => u.Id == request.UserThatIsRequesting, ct);

        if (userThatIsAcceptingOrDenying is null || userThatIsRequesting is null)
            throw new Exception("Sender or receiver not found.");

        var allFriendRequestsByAcceptingParty =
            userThatIsAcceptingOrDenying.ReceivedFriendRequests;
        FriendRequest friendRequest = null;
        foreach (var i in allFriendRequestsByAcceptingParty)
            if (i.RecipientId == userThatIsAcceptingOrDenying.Id)
            {
                friendRequest = i;
                break;
            }

        if (friendRequest == null) throw new FriendRequestNotFoundException();

        var action = request.Action?.ToLowerInvariant();
        if (action is not ("accept" or "deny"))
            throw new ArgumentOutOfRangeException(nameof(request.Action), "Action must be 'accept' or 'deny'.");

        var tx = await db.Database.BeginTransactionAsync(ct);

        if (action == "accept")
        {
            var alreadyAB = await db.Set<Friendship>()
                .AnyAsync(f => f.UserId == userThatIsAcceptingOrDenying.Id && f.FriendId == userThatIsRequesting.Id,
                    ct);
            var alreadyBA = await db.Set<Friendship>()
                .AnyAsync(f => f.UserId == userThatIsRequesting.Id && f.FriendId == userThatIsAcceptingOrDenying.Id,
                    ct);

            if (!alreadyAB)
                db.Set<Friendship>().Add(Friendship.Create(userThatIsAcceptingOrDenying.Id, userThatIsRequesting.Id));

            if (!alreadyBA)
                db.Set<Friendship>().Add(Friendship.Create(userThatIsRequesting.Id, userThatIsAcceptingOrDenying.Id));

            var reverseReq = await db.FriendRequests
                .SingleOrDefaultAsync(
                    fr => fr.RequesterId == userThatIsRequesting.Id &&
                          fr.RecipientId == userThatIsAcceptingOrDenying.Id, ct);

            if (reverseReq is not null) db.Set<FriendRequest>().Remove(reverseReq);
        }

        db.Set<FriendRequest>().Remove(friendRequest);

        try
        {
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateException)
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        return new FriendRequestDto(request.UserThatIsAcceptingOrDenying, request.UserThatIsRequesting);
    }
}