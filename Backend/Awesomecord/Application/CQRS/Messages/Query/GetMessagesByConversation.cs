// ...existing code...

using Application.Common.Exceptions;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Messages.Query;

public class GetMessagesByConversation
{
    public sealed record Query : IRequest<List<MessageDto>>
    {
        public required string ConversationId { get; set; }
        public required string UserId { get; set; }
        public required int Batch { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<MessageDto>>
    {
        private const int PageSize = 30; // messages per batch

        public async Task<List<MessageDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            if (user is null) throw new UserNotFoundException();

            var conversation = await context.Conversation
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

            if (conversation is null) throw new ConversationNotFoundException();

            var isParticipant = conversation.Participants.Any(p => p.UserId == request.UserId);
            if (!isParticipant) throw new UnauthorizedAccessException("User is not a participant of the conversation.");

            var skip = request.Batch * PageSize;

            var messagesQuery = context.Messages
                .Where(m => m.ConversationId == request.ConversationId)
                .OrderByDescending(m => m.SentAt)
                .Skip(skip)
                .Take(PageSize);

            var messages = await messagesQuery.ToListAsync(cancellationToken);

            // We want to send messages in chronological order (oldest first)
            messages.Reverse();

            var dtos = mapper.Map<List<MessageDto>>(messages);
            return dtos;
        }
    }
}

