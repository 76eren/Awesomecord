using Application.Common.Exceptions;
using Application.Users.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Users.Commands;

public sealed class CreateUserHandler(AppDbContext context, IMapper mapper)
    : IRequestHandler<CreateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var doesExist = await context.Users.AnyAsync(u => u.UserHandle == request.UserHandle, ct);
        if (doesExist)
        {
            throw new HandleAlreadyTakenException("User handle is already taken");
        }
        
        var entity = User.Create(
            request.DisplayName, request.UserHandle, request.Bio, request.FirstName, request.LastName, request.Email, request.Phone);

        context.Users.Add(entity);
        await context.SaveChangesAsync(ct);

        return mapper.Map<UserDto>(entity);
    }
}