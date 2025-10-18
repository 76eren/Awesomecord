namespace Application.Notifications;

public interface IStorageService
{
    Task<string> UploadAsync(string objectName, Stream content, string contentType, CancellationToken ct = default);
    Task<bool> ExistsAsync(string objectName, CancellationToken ct = default);
    Task<string> ComputeHashAsync(Stream stream, CancellationToken ct = default);
    Task<string[]> ListFilesAsync(string directory, CancellationToken cancellationToken);
    Task<byte[]?> DownloadAsync(object fileName, CancellationToken cancellationToken);
}