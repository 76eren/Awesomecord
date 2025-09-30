using Application.Common.Exceptions;
using Application.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Users.Queries;

public class LoginRequest
{
    public sealed record LoginUserQuery(string HandleOrEmail, string Password) : IRequest<UserDto>;

    public sealed class LoginUserHandler(AppDbContext context, IMapper mapper) : IRequestHandler<LoginUserQuery, UserDto>
    {
        private readonly PasswordHasher<User> _hasher = new();

        
        public async Task<UserDto> Handle(LoginUserQuery req, CancellationToken ct)
        {
            var user = await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.UserHandle == req.HandleOrEmail || u.Email == req.HandleOrEmail, ct);

            if (user is null)
            {
                throw new InvalidCredentialsException();
            }

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                throw new InvalidCredentialsException();
            }

            return mapper.Map<UserDto>(user);
        }
    }
}