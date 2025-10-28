using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using API.Hubs;
using API.Middleware;
using API.Services;
using Application.CQRS.Users.Commands;
using Application.Interfaces;
using Application.Notifications;
using DotNetEnv;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Persistence;
using Persistence.storage;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add environment variables as a configuration source
var envFile = builder.Environment.IsDevelopment() ? ".env.development" : ".env.production";
Env.Load(Path.Combine(builder.Environment.ContentRootPath, envFile));

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    opt.UseLazyLoadingProxies();
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<CreateUserHandler>();
    cfg.LicenseKey = Environment.GetEnvironmentVariable("MEDIATR_LICENSE_KEY");
});

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
builder.Services.AddAutoMapper(
    typeof(CreateUserHandler).Assembly,
    Assembly.GetExecutingAssembly()
);

// JWT configuration
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtOptions = new JwtOptions
{
    Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSection["Issuer"],
    Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSection["Audience"],
    SigningKey = Environment.GetEnvironmentVariable("JWT_SIGNING_KEY") ?? jwtSection["SigningKey"],
    AccessTokenMinutes = int.TryParse(Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_MINUTES"), out var atm)
        ? atm
        : int.Parse(jwtSection["AccessTokenMinutes"] ?? "60"),
    RefreshTokenDays = int.TryParse(Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_DAYS"), out var rtd)
        ? rtd
        : int.Parse(jwtSection["RefreshTokenDays"] ?? "30")
};
builder.Services.Configure<JwtOptions>(opts =>
{
    opts.Issuer = jwtOptions.Issuer;
    opts.Audience = jwtOptions.Audience;
    opts.SigningKey = jwtOptions.SigningKey;
    opts.AccessTokenMinutes = jwtOptions.AccessTokenMinutes;
    opts.RefreshTokenDays = jwtOptions.RefreshTokenDays;
});
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

// Update JWT Bearer authentication to use jwtOptions
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("access_token", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add CORS policy for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCorsPolicy", policy =>
        policy.WithOrigins("https://localhost:5173", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});


builder.Services
    .AddSignalR()
    .AddJsonProtocol(opts =>
    {
        opts.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.PayloadSerializerOptions.MaxDepth = 16;
    });
builder.Services.AddSingleton<IUserIdProvider, NameIdentifierUserIdProvider>();
builder.Services.AddScoped<IUserUpdatePublisher, SignalrUserUpdatePublisher>();
builder.Services.AddScoped<IConversationUpdatePublisher, SignalrConversationUpdatePublisher>();
builder.Services.AddScoped<IMessagePublisher, SignalrMessageService>();
builder.Services.AddSingleton<IStorageService, MinioStorageService>();
builder.Services.Configure<StorageOptions>(
    builder.Configuration.GetSection(StorageOptions.SectionName)
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

using (var scope = app.Services.CreateScope())
{
    var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
    var logger = loggerFactory.CreateLogger("Startup");

    try
    {
        var storage = scope.ServiceProvider.GetRequiredService<IStorageService>();
        if (storage is MinioStorageService minio)
        {
            await minio.SeedData();
            logger.LogInformation("MinIO seed completed.");
        }
        else
        {
            logger.LogInformation("IStorageService is not MinioStorageService; skipping MinIO seed.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "MinIO seed failed.");
    }
}

var fh = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
fh.KnownNetworks.Clear();
fh.KnownProxies.Clear();
app.UseForwardedHeaders(fh);

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseCors("DevelopmentCorsPolicy"); // Register CORS middleware before auth
}

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<UpdateOwnUserHub>("/hubs/userupdates");
app.MapHub<UpdateConversationsHub>("/hubs/conversationupdates");
app.MapHub<MessageHub>("/hubs/messages");

app.MapControllers();

app.Run();

public sealed class JwtOptions
{
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string SigningKey { get; set; } = default!;
    public int AccessTokenMinutes { get; set; }
    public int RefreshTokenDays { get; set; }
}