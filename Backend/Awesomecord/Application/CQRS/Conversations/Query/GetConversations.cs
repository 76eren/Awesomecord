using Application.Common.Exceptions;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Conversations.Query;

public class GetConversations
{
    public sealed record Query : IRequest<List<ConversationDto>>
    {
        public required string User { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<ConversationDto>>
    {
        public async Task<List<ConversationDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == request.User, cancellationToken);
            if (user == null) throw new UserNotFoundException();

            var conversations = context.Conversation
                .Where(c => c.Participants.Any(p => p.UserId == request.User))
                .ToList();

            var conversationDtos = mapper.Map<List<ConversationDto>>(conversations);

            return conversationDtos;
        }
    }
}