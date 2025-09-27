namespace Domain;

public class RefreshToken
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string UserId { get; private set; } = default!;
    public string TokenHash { get; private set; } = default!;
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? RevokedAtUtc { get; private set; }
    public string? ReplacedById { get; private set; }

    public bool IsActive => RevokedAtUtc is null && DateTime.UtcNow < ExpiresAtUtc;

    private RefreshToken() { }

    public static RefreshToken Create(string userId, string tokenHash, DateTime expiresAtUtc) =>
        new()
        {
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAtUtc = expiresAtUtc
        };

    public void Revoke(string? replacedById = null)
    {
        RevokedAtUtc = DateTime.UtcNow;
        ReplacedById = replacedById;
    }
}