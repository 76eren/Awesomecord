using Application.Users.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Users.Commands;

public sealed class CreateUserHandler(AppDbContext context, IMapper mapper)
    : IRequestHandler<CreateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var entity = User.Create(
            request.DisplayName, request.UserHandle, request.Bio, request.FirstName, request.LastName, request.Email, request.Phone);

        context.Users.Add(entity);
        await context.SaveChangesAsync(ct);

        return mapper.Map<UserDto>(entity);
    }
}