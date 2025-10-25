using Application.DTOs;
using MediatR;

namespace Application.CQRS.Messages.Commands;

public sealed record EditMessageCommand(
    string MessageId,
    string RequesterId,
    string NewBody
) : IRequest<MessageDto>;

