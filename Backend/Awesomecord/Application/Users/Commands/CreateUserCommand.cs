using Application.Users.DTOs;
using MediatR;

namespace Application.Users.Commands;


public sealed record CreateUserCommand(
    string DisplayName,
    string UserHandle,
    string Bio,
    string FirstName,
    string LastName,
    string Email,
    string Phone
) : IRequest<UserDto>;