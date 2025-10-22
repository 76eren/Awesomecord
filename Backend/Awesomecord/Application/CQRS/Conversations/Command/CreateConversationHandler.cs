using Application.CQRS.Conversations.Query;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Conversations.Command;

public sealed class CreateConversationHandler(
    AppDbContext dbContext,
    IConversationUpdatePublisher _conversationUpdatePublisher,
    IMediator _mediator
) : IRequestHandler<CreateConversationCommand, Unit>
{
    public async Task<Unit> Handle(CreateConversationCommand request, CancellationToken cancellationToken)
    {
        var userA = dbContext.Users.FirstOrDefaultAsync(u => u.Id == request.UserIdA, cancellationToken);
        var userB = dbContext.Users.FirstOrDefaultAsync(u => u.Id == request.UserIdB, cancellationToken);

        if (await userA is null || await userB is null) throw new Exception("One or both users do not exist.");

        // Check if a conversation already exists between the two users
        var existingConversation = await dbContext.Conversation
            .FirstOrDefaultAsync(c =>
                    c.Participants.Any(p => p.UserId == request.UserIdA) &&
                    c.Participants.Any(p => p.UserId == request.UserIdB),
                cancellationToken);

        if (existingConversation is null)
        {
            var conversation = new Conversation
            {
                Id = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow,
                Participants = new List<ConversationParticipent>
                {
                    new() { UserId = request.UserIdA },
                    new() { UserId = request.UserIdB }
                }
            };

            dbContext.Conversation.Add(conversation);

            UpdateConversationsListParticipants(request.UserIdA);
            UpdateConversationsListParticipants(request.UserIdB);

            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }

    private async void UpdateConversationsListParticipants(string userId)
    {
        try
        {
            var query = new GetConversations.Query
            {
                User = userId
            };

            var conversations = await _mediator.Send(query);
            await _conversationUpdatePublisher.ConversationsUpdatedAsync(userId, conversations);
        }
        catch (Exception e)
        {
        }
    }
}