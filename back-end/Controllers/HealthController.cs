using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_end.Data;

namespace back_end.Controllers;

[ApiController]
[Route("health")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly BookingContext _context;

    public HealthController(BookingContext context)
    {
        _context = context;
    }

    [HttpGet("db")]
    public async Task<IActionResult> CheckDatabase()
    {
        await _context.Users.AsNoTracking().AnyAsync();
        return Ok("ok");
    }
}