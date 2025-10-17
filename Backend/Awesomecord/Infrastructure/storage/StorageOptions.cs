namespace Persistence.storage;

// Todo: make these come out of a config file, these are for testing only for now
public sealed class StorageOptions
{
    public const string SectionName = "Minio";
    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = "minioadmin";
    public string SecretKey { get; set; } = "minioadmin123";
    public string Bucket { get; set; } = "images";
    public bool WithSsl { get; set; } = false;
    public int PreSignedExpiryMinutes { get; set; } = 60;
}