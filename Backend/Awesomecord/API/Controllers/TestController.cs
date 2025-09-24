using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class TestController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<string>> GetTest()
    {
        return Ok("this works!");
    }
    
}