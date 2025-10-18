using MediatR;

namespace Application.CQRS.Images;

public sealed record UploadProfilePictureCommand(string FileName, string ContentType, string UserId, Stream Content)
    : IRequest<string>;