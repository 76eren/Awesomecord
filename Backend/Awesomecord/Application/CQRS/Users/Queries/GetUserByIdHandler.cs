using Application.DTOs;
using AutoMapper;
using MediatR;
using Persistence;

namespace Application.CQRS.Users.Queries;

public class GetUserById
{
    public sealed record Query : IRequest<UserDto>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, UserDto>
    {
        public async Task<UserDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var entity = await context.Users.FindAsync(request.Id);

            if (entity is null)
            {
                throw new Exception("User not found");
            }
        
            return mapper.Map<UserDto>(entity);
        }
    }
    
}