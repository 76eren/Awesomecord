using Application.CQRS.Users.Commands;
using FluentValidation;

namespace Application.CQRS.Users.Commands;

public sealed class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UserHandle).NotEmpty().Matches("^[a-zA-Z0-9_\\.]{3,30}$");
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.Phone).NotEmpty();
        RuleFor(x => x.Bio).MaximumLength(100).NotEmpty();
    }
}