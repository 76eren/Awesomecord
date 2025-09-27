namespace API.Services;

using System.Security.Cryptography;
using System.Text;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;

public interface IRefreshTokenService
{
    Task<(string opaqueToken, RefreshToken row)> IssueAsync(string userId, CancellationToken ct);
    Task<(User user, RefreshToken current)> ValidateAsync(string opaqueToken, CancellationToken ct);
    Task<(string newOpaque, RefreshToken newRow)> RotateAsync(RefreshToken current, CancellationToken ct);
    Task RevokeAsync(RefreshToken current, CancellationToken ct);
    string Hash(string opaqueToken);
}

public sealed class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly JwtOptions _opts;

    public RefreshTokenService(AppDbContext db, IOptions<JwtOptions> opts)
    {
        _db = db;
        _opts = opts.Value;
    }

    public async Task<(string opaqueToken, RefreshToken row)> IssueAsync(string userId, CancellationToken ct)
    {
        var opaque = GenerateOpaque();
        var hash = Hash(opaque);
        var row = RefreshToken.Create(
            userId,
            hash,
            DateTime.UtcNow.AddDays(_opts.RefreshTokenDays));

        _db.RefreshTokens.Add(row);
        await _db.SaveChangesAsync(ct);
        return (opaque, row);
    }

    public async Task<(User user, RefreshToken current)> ValidateAsync(string opaqueToken, CancellationToken ct)
    {
        var hash = Hash(opaqueToken);
        var current = await _db.RefreshTokens
            .AsTracking()
            .FirstOrDefaultAsync(x => x.TokenHash == hash, ct);

        if (current is null || !current.IsActive)
            throw new InvalidRefreshTokenException();

        var user = await _db.Users.FindAsync(new object?[] { current.UserId }, ct)
                   ?? throw new InvalidRefreshTokenException();

        return (user, current);
    }

    public async Task<(string newOpaque, RefreshToken newRow)> RotateAsync(RefreshToken current, CancellationToken ct)
    {
        var (opaque, row) = await IssueAsync(current.UserId, ct);
        current.Revoke(row.Id);
        await _db.SaveChangesAsync(ct);
        return (opaque, row);
    }

    public async Task RevokeAsync(RefreshToken current, CancellationToken ct)
    {
        current.Revoke();
        await _db.SaveChangesAsync(ct);
    }

    public string Hash(string opaqueToken)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(opaqueToken));
        return Convert.ToHexString(bytes);
    }

    private static string GenerateOpaque()
    {
        Span<byte> b = stackalloc byte[32];
        RandomNumberGenerator.Fill(b);
        return Convert.ToBase64String(b);
    }
}

public sealed class InvalidRefreshTokenException : Exception { }