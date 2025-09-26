using Domain;

namespace Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.DisplayName).IsRequired().HasMaxLength(100);
        b.Property(x => x.UserHandle).IsRequired().HasMaxLength(30);
        b.Property(x => x.Email).IsRequired().HasMaxLength(256);
        b.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        b.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        b.Property(x => x.Phone).IsRequired().HasMaxLength(30);
        b.HasIndex(x => x.UserHandle).IsUnique();
        b.HasIndex(x => x.Email).IsUnique();
        b.Property(x => x.Bio).HasMaxLength(150);
    }
}