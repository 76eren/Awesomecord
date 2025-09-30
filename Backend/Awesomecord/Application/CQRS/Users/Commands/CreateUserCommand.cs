using Application.DTOs;
using MediatR;

namespace Application.CQRS.Users.Commands;


public sealed record CreateUserCommand(
    string DisplayName,
    string UserHandle,
    string Bio,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Password
) : IRequest<UserDto>;