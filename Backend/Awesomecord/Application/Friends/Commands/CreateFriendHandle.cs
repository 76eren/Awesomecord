using Application.Common.Exceptions;
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
        {
            throw new ArgumentException("Sender or receiver not found.");
        }
        
        var existingRequest = await db.FriendRequests.FirstOrDefaultAsync(fr => 
            fr.RequesterId == sender.Id && fr.RecipientId == receiver.Id, cancellationToken);
        if (existingRequest is not null)
        {
            throw new FriendRequestAlreadyExistsException();
        }

        var friendRequest = FriendRequest.Create(sender.Id, receiver.Id);
        db.Set<FriendRequest>().Add(friendRequest);
        

        await db.SaveChangesAsync(cancellationToken);

        return new FriendRequestDto(request.SenderHandle, request.ReceiverHandle);
    }
}