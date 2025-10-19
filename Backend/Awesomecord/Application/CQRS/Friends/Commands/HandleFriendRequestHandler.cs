using Application.Common.Exceptions;
using Application.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class HandleFriendRequestHandler(AppDbContext db)
    : IRequestHandler<HandleFriendRequestCommand, FriendRequestDto>
{
    public async Task<FriendRequestDto> Handle(HandleFriendRequestCommand request, CancellationToken ct)
    {
        var recipientId = request.RecipientId;
        var requesterId = request.RequesterId;

        var recipientExists = await db.Users.AnyAsync(u => u.Id == recipientId, ct);
        var requesterExists = await db.Users.AnyAsync(u => u.Id == requesterId, ct);
        if (!recipientExists || !requesterExists)
            throw new UserNotFoundException();

        var action = request.Action?.Trim().ToLowerInvariant();

        // Forward: requester -> recipient
        var forwardReq = await db.FriendRequests
            .SingleOrDefaultAsync(fr => fr.RequesterId == requesterId && fr.RecipientId == recipientId, ct);

        // Reverse: recipient -> requester
        var reverseReq = await db.FriendRequests
            .SingleOrDefaultAsync(fr => fr.RequesterId == recipientId && fr.RecipientId == requesterId, ct);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            switch (action)
            {
                case "accept":
                {
                    // Accept whichever request exists; if both exist, auto-friend and clear both.
                    if (forwardReq is null && reverseReq is null)
                        throw new FriendRequestNotFoundException();

                    await EnsureFriendshipAsync(recipientId, requesterId, ct);

                    if (forwardReq is not null) db.FriendRequests.Remove(forwardReq);
                    if (reverseReq is not null) db.FriendRequests.Remove(reverseReq);

                    await db.SaveChangesAsync(ct);
                    await tx.CommitAsync(ct);
                    return new FriendRequestDto(recipientId, requesterId);
                }

                case "deny":
                {
                    // Deny removes the pending request(s) without creating friendship.
                    if (forwardReq is null && reverseReq is null)
                        throw new FriendRequestNotFoundException();

                    if (forwardReq is not null) db.FriendRequests.Remove(forwardReq);
                    if (reverseReq is not null) db.FriendRequests.Remove(reverseReq);

                    await db.SaveChangesAsync(ct);
                    await tx.CommitAsync(ct);
                    return new FriendRequestDto(recipientId, requesterId);
                }

                case "cancel":
                {
                    // Only the sender can cancel their own outgoing request.
                    if (forwardReq is null)
                        throw new FriendRequestNotFoundException();

                    db.FriendRequests.Remove(forwardReq);

                    await db.SaveChangesAsync(ct);
                    await tx.CommitAsync(ct);
                    return new FriendRequestDto(recipientId, requesterId);
                }

                default:
                    throw new ArgumentOutOfRangeException(nameof(request.Action),
                        "Action must be 'accept', 'deny', or 'cancel'.");
            }
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    private async Task EnsureFriendshipAsync(string aId, string bId, CancellationToken ct)
    {
        var alreadyAB = await db.Set<Friendship>().AnyAsync(f => f.UserId == aId && f.FriendId == bId, ct);
        var alreadyBA = await db.Set<Friendship>().AnyAsync(f => f.UserId == bId && f.FriendId == aId, ct);

        if (!alreadyAB)
            db.Set<Friendship>().Add(Friendship.Create(aId, bId));

        if (!alreadyBA)
            db.Set<Friendship>().Add(Friendship.Create(bId, aId));
    }
}