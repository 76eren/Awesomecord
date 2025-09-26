using Application.Users.Commands;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<CreateUserHandler>());

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();

builder.Services.AddAutoMapper(
    typeof(CreateUserHandler).Assembly,
    Assembly.GetExecutingAssembly()
);

var app = builder.Build();

app.MapControllers();
app.Run();