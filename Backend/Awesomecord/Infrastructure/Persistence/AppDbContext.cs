using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;
    public DbSet<User> Users { get; set; }
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<Conversation> Conversation => Set<Conversation>();
    public DbSet<ConversationParticipent> ConversationParticipent => Set<ConversationParticipent>();
    public DbSet<Message> Messages => Set<Message>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.UserHandle).IsUnique();
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<RefreshToken>(b =>
        {
            b.HasIndex(rt => rt.TokenHash).IsUnique();
            b.Property(rt => rt.TokenHash).IsRequired();
            b.Property(rt => rt.UserId).IsRequired();
            b.HasOne<User>()
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<FriendRequest>(b =>
        {
            b.HasKey(f => f.Id);
            b.Property(fr => fr.RequesterId).HasMaxLength(64);
            b.Property(fr => fr.RecipientId).HasMaxLength(64);

            b.Property(fr => fr.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            b.HasOne(fr => fr.Requester)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr => fr.RequesterId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(fr => fr.Recipient)
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(fr => fr.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasCheckConstraint("CK_FriendRequest_NotSelf", "[RequesterId] <> [RecipientId]");
            b.HasIndex(fr => new { fr.RequesterId, fr.RecipientId })
                .IsUnique();
        });

        modelBuilder.Entity<Friendship>(b =>
        {
            b.HasKey(f => f.Id);
            b.HasOne(f => f.User)
                .WithMany(u => u.Friends)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(f => f.Friend)
                .WithMany()
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Property(f => f.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Conversation>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasMany(x => x.Participants)
                .WithOne(x => x.Conversation)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasMany(x => x.Messages)
                .WithOne(x => x.Conversation)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            b.Property(x => x.CreatedAt).HasPrecision(0);
        });

        modelBuilder.Entity<ConversationParticipent>(b =>
        {
            b.HasKey(x => new { x.ConversationId, x.UserId });
            b.HasIndex(x => x.UserId);
            b.Property(x => x.JoinedAt).HasPrecision(0);
        });

        modelBuilder.Entity<Message>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.ConversationId, x.SentAt });
            b.Property(x => x.Body).IsRequired().HasMaxLength(4000);
            b.Property(x => x.SentAt).HasPrecision(0);
        });
    }
}