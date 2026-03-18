using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    [AllowAnonymous]
    public IActionResult CreateUser([FromBody] RegisterRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest("Nome, Email e Senha são obrigatórios.");
        }

        if (_context.Users.Any(u => u.Email == request.Email))
        {
            return Conflict("Já existe um usuário cadastrado com esse email.");
        }

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Senha)
        };

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