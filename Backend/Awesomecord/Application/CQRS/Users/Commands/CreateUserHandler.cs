using Application.Common.Exceptions;
using Application.Users.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Microsoft.AspNetCore.Identity;
namespace Application.Users.Commands;

public sealed class CreateUserHandler(AppDbContext context, IMapper mapper)
    : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly PasswordHasher<User> _hasher = new ();
    
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var tempUser = new User();
        var passwordHash = _hasher.HashPassword(tempUser, request.Password);
        
        if (await context.Users.AnyAsync(u => u.UserHandle == request.UserHandle || u.Email == request.Email, ct))
        {
            throw new HandleAlreadyTakenException("User handle or email is already taken");
        }
        
        var entity = User.Create(
            request.DisplayName, request.UserHandle, request.Bio, request.FirstName, request.LastName, request.Email, request.Phone, passwordHash
            );

        context.Users.Add(entity);
        await context.SaveChangesAsync(ct);

        return mapper.Map<UserDto>(entity);
    }
}