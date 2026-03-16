using Microsoft.AspNetCore.Mvc;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly BookingContext _context;

    public UsersController(BookingContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = _context.Users.ToList();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var user = _context.Users.Find(id);
        if (user == null)
        {
            return NotFound("Usuário não encontrado.");
        }
        return Ok(user);
    }

    [HttpPost]
    public IActionResult CreateUser([FromBody] User user)
    {
        if (user == null || string.IsNullOrEmpty(user.Nome) || string.IsNullOrEmpty(user.Email))
        {
            return BadRequest("Nome e Email são obrigatórios.");
        }

        _context.Users.Add(user);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] User user)
    {
        if (user == null || string.IsNullOrEmpty(user.Nome) || string.IsNullOrEmpty(user.Email))
        {
            return BadRequest("Nome e Email são obrigatórios.");
        }

        var existingUser = _context.Users.Find(id);
        if (existingUser == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        existingUser.Nome = user.Nome;
        existingUser.Email = user.Email;
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _context.Users.Find(id);
        if (user == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        _context.Users.Remove(user);
        _context.SaveChanges();
        return NoContent();
    }
}