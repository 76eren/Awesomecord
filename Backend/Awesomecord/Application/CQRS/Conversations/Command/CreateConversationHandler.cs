using Application.CQRS.Conversations.Query;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CQRS.Conversations.Command;

public sealed class CreateConversationHandler(
    AppDbContext dbContext,
    IConversationUpdatePublisher conversationUpdatePublisher,
    IMediator mediator
) : IRequestHandler<CreateConversationCommand, Unit>
{
    public async Task<Unit> Handle(CreateConversationCommand request, CancellationToken cancellationToken)
    {
        var participantIds = new HashSet<string>(request.ParticipantUserIds.Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id.Trim()));
        participantIds.Add(request.InitiatorUserId);

        if (participantIds.Count < 2)
            throw new Exception("At least two distinct users are required to create a conversation.");

        var usersCount = await dbContext.Users.CountAsync(u => participantIds.Contains(u.Id), cancellationToken);
        if (usersCount != participantIds.Count)
            throw new Exception("One or more users do not exist.");

        var expectedCount = participantIds.Count;
        var existingConversation = await dbContext.Conversation
            .Where(c => c.Participants.Count() == expectedCount)
            .Where(c => c.Participants.All(p => participantIds.Contains(p.UserId)))
            .FirstOrDefaultAsync(cancellationToken);

        if (existingConversation is null)
        {
            var conversation = Conversation.Create(participantIds, request.title);
            dbContext.Conversation.Add(conversation);

            foreach (var uid in participantIds) UpdateConversationsListParticipants(uid);

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

            var conversations = await mediator.Send(query);
            await conversationUpdatePublisher.ConversationsUpdatedAsync(userId, conversations);
        }
        catch
        {
        }
    }
}