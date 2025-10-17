namespace Application.Notifications;

public interface IStorageService
{
    Task<string> UploadAsync(string objectName, Stream content, string contentType, CancellationToken ct = default);
    Task<bool> ExistsAsync(string objectName, CancellationToken ct = default);
}