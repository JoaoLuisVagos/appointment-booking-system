using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using System.Security.Claims;
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
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return Ok(Array.Empty<User>());
        }

        var users = _context.Users
            .Where(u => u.LojaId == lojaId.Value || u.Id == lojaId.Value)
            .ToList();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        var user = _context.Users.SingleOrDefault(u => u.Id == id && (u.LojaId == lojaId.Value || u.Id == lojaId.Value));
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

        var normalizedRole = NormalizeRole(request.Role);
        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Role = normalizedRole
        };

        if (User.Identity?.IsAuthenticated == true)
        {
            var lojaId = GetScopeLojaId();
            if (lojaId == null)
            {
                return BadRequest("Não foi possível identificar a loja para este usuário.");
            }

            if (normalizedRole == "loja")
            {
                return BadRequest("Use o cadastro de loja para criar uma nova loja.");
            }

            user.LojaId = lojaId.Value;
        }
        else
        {
            if (normalizedRole != "cliente")
            {
                return BadRequest("Cadastro anônimo permitido apenas para cliente.");
            }
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

        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        var existingUser = _context.Users.SingleOrDefault(u => u.Id == id && (u.LojaId == lojaId.Value || u.Id == lojaId.Value));
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
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        var user = _context.Users.SingleOrDefault(u => u.Id == id && u.LojaId == lojaId.Value);
        if (user == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        _context.Users.Remove(user);
        _context.SaveChanges();
        return NoContent();
    }

    private static string NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return "cliente";
        }

        var normalizedRole = role.Trim().ToLowerInvariant();
        if (normalizedRole == "vendedor")
        {
            return "loja";
        }

        if (normalizedRole != "cliente" && normalizedRole != "loja" && normalizedRole != "funcionario")
        {
            return "cliente";
        }

        return normalizedRole;
    }

    private int? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(idClaim, out var userId) ? userId : null;
    }

    private int? GetScopeLojaId()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return null;
        }

        var user = _context.Users
            .Where(u => u.Id == userId.Value)
            .Select(u => new { u.Id, u.Role, u.LojaId })
            .SingleOrDefault();

        if (user == null)
        {
            return null;
        }

        var role = NormalizeRole(user.Role);
        if (role == "loja")
        {
            return user.LojaId ?? user.Id;
        }

        return user.LojaId;
    }
}