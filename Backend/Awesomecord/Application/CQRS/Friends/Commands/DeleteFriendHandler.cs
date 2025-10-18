using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Friends.Commands;

public sealed class DeleteFriendHandler(AppDbContext db) : IRequestHandler<DeleteFriendCommand, Unit>
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
        return Unit.Value;
    }
}