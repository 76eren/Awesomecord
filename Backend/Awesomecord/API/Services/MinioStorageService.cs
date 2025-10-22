using System.Security.Cryptography;
using System.Text;
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
            .WithExpiry(_options.PresignedExpiryMinutes * 60);

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

    public async Task<string> ComputeHashAsync(Stream stream, CancellationToken ct = default)
    {
        if (stream == null)
            throw new ArgumentNullException(nameof(stream));

        if (stream.CanSeek) stream.Seek(0, SeekOrigin.Begin);

        using var sha = SHA256.Create();
        var hash = await sha.ComputeHashAsync(stream, ct);

        if (stream.CanSeek)
            stream.Seek(0, SeekOrigin.Begin);

        var sb = new StringBuilder();
        foreach (var b in hash)
            sb.Append(b.ToString("x2"));

        return sb.ToString();
    }

    public async Task<string[]> ListFilesAsync(string directory, CancellationToken cancellationToken)
    {
        var results = new List<string>();

        var listArgs = new ListObjectsArgs()
            .WithBucket(_options.Bucket)
            .WithPrefix(directory ?? string.Empty)
            .WithRecursive(true);

        var observable = _client.ListObjectsEnumAsync(listArgs, cancellationToken);

        await foreach (var item in observable.WithCancellation(cancellationToken)) results.Add(item.Key);

        return results.ToArray();
    }

    public async Task<byte[]?> DownloadAsync(object fileName, CancellationToken cancellationToken)
    {
        if (fileName == null)
            throw new ArgumentNullException(nameof(fileName));

        await EnsureBucketAsync(cancellationToken);

        using var memoryStream = new MemoryStream();

        var getObjectArgs = new GetObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(fileName.ToString()!)
            .WithCallbackStream(stream => stream.CopyTo(memoryStream));

        try
        {
            await _client.GetObjectAsync(getObjectArgs, cancellationToken);
            return memoryStream.ToArray();
        }
        catch (ObjectNotFoundException)
        {
            return null;
        }
    }

    private async Task EnsureBucketAsync(CancellationToken ct)
    {
        var exists = await _client.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_options.Bucket), ct);

        if (!exists) await _client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_options.Bucket), ct);
    }

    public async Task SeedData()
    {
        bool found = await _client.BucketExistsAsync(new BucketExistsArgs().WithBucket(_options.Bucket));
        if (!found)
        {
            await _client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_options.Bucket));
            Console.WriteLine($"Bucket '{_options.Bucket}' created.");
        }

        var directory = "users/";
        var objectName = $"{directory}default-profile.jpg";
        var contentRoot = AppContext.BaseDirectory;
        var defaultImagePath = Path.Combine(contentRoot, "images", "default-profile.jpg");
        
        if (!File.Exists(defaultImagePath))
        {
            Console.WriteLine($"Default image not found at `{defaultImagePath}`. Skipping upload.");
            return;
        }

        try
        {
            await _client.StatObjectAsync(new StatObjectArgs().WithBucket(_options.Bucket).WithObject(directory));
        }
        catch (ObjectNotFoundException)
        {
            using var emptyStream = new MemoryStream(Array.Empty<byte>());
            await _client.PutObjectAsync(new PutObjectArgs()
                .WithBucket(_options.Bucket)
                .WithObject(directory)
                .WithStreamData(emptyStream)
                .WithObjectSize(0)
                .WithContentType("application/x-directory"));
            Console.WriteLine($"Directory `{directory}` created in bucket.");
        }

        try
        {
            await _client.StatObjectAsync(new StatObjectArgs().WithBucket(_options.Bucket).WithObject(objectName));
            Console.WriteLine("Default image already exists in bucket.");
        }
        catch (ObjectNotFoundException)
        {
            await _client.PutObjectAsync(new PutObjectArgs()
                .WithBucket(_options.Bucket)
                .WithObject(objectName)
                .WithFileName(defaultImagePath)
                .WithContentType("image/jpeg"));

            Console.WriteLine("Default image uploaded to bucket.");
        }
    }
    
}