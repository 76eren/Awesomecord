namespace API.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;

[Route("api/v1/[controller]")]
[ApiController]
public class BaseApiController : ControllerBase
{
    private IMediator? _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>() 
                                                  ?? throw new InvalidOperationException("IMediator service is not registered.");
    

}