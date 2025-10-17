using MediatR;

namespace Application.CQRS.Images;

public sealed record UploadImageCommand(string FileName, string ContentType, Stream Content) : IRequest<string>;