namespace Persistence.storage;

public sealed class StorageOptions
{
    public const string SectionName = "Minio";
    public string Endpoint { get; set; } = null!;
    public string AccessKey { get; set; } = null!;
    public string SecretKey { get; set; } = null!;
    public string Bucket { get; set; } = null!;
    public bool WithSsl { get; set; }
    public int PresignedExpiryMinutes { get; set; }
}