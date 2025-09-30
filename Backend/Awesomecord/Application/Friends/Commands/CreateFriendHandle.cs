using Application.Users.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Friends.Commands;

public sealed class CreateFriendHandle(AppDbContext db, IMapper mapper) : IRequestHandler<CreateFriendRequestCommand, FriendRequestDto>
{
    public async Task<FriendRequestDto> Handle(CreateFriendRequestCommand request, CancellationToken cancellationToken)
    {
        var sender = await db.Users.FirstOrDefaultAsync(u => u.UserHandle == request.SenderHandle, cancellationToken);
        var receiver = await db.Users.FirstOrDefaultAsync(u => u.UserHandle == request.ReceiverHandle, cancellationToken);

        if (sender is null || receiver is null)
            throw new ArgumentException("Sender or receiver not found.");

        var friendRequest = FriendRequest.Create(sender.Id, receiver.Id);
        db.Set<FriendRequest>().Add(friendRequest);
        

        await db.SaveChangesAsync(cancellationToken);
        
        // Fetch user to test
        // Find with handle testuser
        // var user1 = db.Users.FirstOrDefault(u => u.UserHandle == "testuser");
        // var user2 = db.Users.FirstOrDefault(u => u.UserHandle == "testuser2");


        return new FriendRequestDto(request.SenderHandle, request.ReceiverHandle);
    }
}