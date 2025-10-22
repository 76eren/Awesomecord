using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Notifications;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class DeleteFriendHandler(AppDbContext db, IUserUpdatePublisher notifier)
    : IRequestHandler<DeleteFriendCommand, Unit>
{
    public async Task<Unit> Handle(DeleteFriendCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        var friend = await db.Users.FirstOrDefaultAsync(u => u.Id == request.FriendId, cancellationToken);

        if (user is null || friend is null)
            throw new Exception("User or friend not found.");

        var FriendshipA = await db.Friendships
            .FirstOrDefaultAsync(f => f.UserId == user.Id && f.FriendId == friend.Id, cancellationToken);
        var FriendshipB = await db.Friendships
            .FirstOrDefaultAsync(f => f.UserId == friend.Id && f.FriendId == user.Id, cancellationToken);

        if (FriendshipA is null || FriendshipB is null) throw new Exception("Friendship does not exist.");

        db.Friendships.Remove(FriendshipA);
        db.Friendships.Remove(FriendshipB);

        await db.SaveChangesAsync(cancellationToken);

        await NotifyFriendDeletion(user, friend, cancellationToken);

        return Unit.Value;
    }

    private async Task NotifyFriendDeletion(User user, User friend, CancellationToken cancellationToken)
    {
        var updatedUserADto = UserFlatDto.FromUser(user);
        var payloadUserA = new UpdateReceivedPayload<UserFlatDto>
        {
            UpdatedUserModel = updatedUserADto
        };
        await notifier.UserUpdatedAsync(user.Id, payloadUserA, cancellationToken);

        var updatedUserBDto = UserFlatDto.FromUser(friend);
        var payloadUserB = new UpdateReceivedPayload<UserFlatDto>
        {
            UpdatedUserModel = updatedUserBDto
        };
        await notifier.UserUpdatedAsync(friend.Id, payloadUserB, cancellationToken);
    }
}