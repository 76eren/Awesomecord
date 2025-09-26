using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BaseApiController : ControllerBase
{
    private IMediator? _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>() 
                                                  ?? throw new InvalidOperationException("IMediator service is not registered.");
    
    private IMapper? _mapper;
    protected IMapper Mapper => _mapper ??= HttpContext.RequestServices.GetService<IMapper>() 
                                              ?? throw new InvalidOperationException("IMapper service is not registered.");
}