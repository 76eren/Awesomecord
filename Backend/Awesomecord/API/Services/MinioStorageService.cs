using Application.Notifications;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using Persistence.storage;

namespace API.Services;

public sealed class MinioStorageService : IStorageService
{
    private readonly IMinioClient _client;
    private readonly StorageOptions _options;

    public MinioStorageService(IOptions<StorageOptions> options)
    {
        _options = options.Value;
        _client = new MinioClient()
            .WithEndpoint(_options.Endpoint)
            .WithCredentials(_options.AccessKey, _options.SecretKey)
            .WithSSL(_options.WithSsl)
            .Build();
    }

    public async Task<string> UploadAsync(string objectName, Stream content, string contentType,
        CancellationToken ct = default)
    {
        await EnsureBucketAsync(ct);

        var put = new PutObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectName)
            .WithStreamData(content)
            .WithObjectSize(content.Length)
            .WithContentType(contentType);

        await _client.PutObjectAsync(put, ct);

        var presign = new PresignedGetObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectName)
            .WithExpiry(_options.PreSignedExpiryMinutes * 60);

        return await _client.PresignedGetObjectAsync(presign);
    }

    public async Task<bool> ExistsAsync(string objectName, CancellationToken ct = default)
    {
        try
        {
            var stat = new StatObjectArgs()
                .WithBucket(_options.Bucket)
                .WithObject(objectName);

            await _client.StatObjectAsync(stat, ct);
            return true;
        }
        catch (ObjectNotFoundException)
        {
            return false;
        }
    }

    private async Task EnsureBucketAsync(CancellationToken ct)
    {
        var exists = await _client.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_options.Bucket), ct);

        if (!exists) await _client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_options.Bucket), ct);
    }
}