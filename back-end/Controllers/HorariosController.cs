using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HorariosController : ControllerBase
{
    private readonly BookingContext _context;

    public HorariosController(BookingContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetHorarios()
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return Ok(Array.Empty<object>());
        }

        var horarios = _context.Horarios
            .AsNoTracking()
            .Where(h => h.LojaId == lojaId.Value)
            .Select(h => new
            {
                h.Id,
                h.UsuarioId,
                h.ProdutoId,
                h.DataHora,
                Usuario = h.Usuario == null
                    ? null
                    : new
                    {
                        h.Usuario.Id,
                        h.Usuario.Nome,
                        h.Usuario.Email,
                        h.Usuario.Role
                    },
                Produto = h.Produto == null
                    ? null
                    : new
                    {
                        h.Produto.Id,
                        h.Produto.Nome,
                        h.Produto.Preco
                    }
            })
            .ToList();

        return Ok(horarios);
    }

    [HttpGet("{id}")]
    public IActionResult GetHorario(int id)
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Horário não encontrado.");
        }

        var horario = _context.Horarios
            .AsNoTracking()
            .Where(h => h.Id == id && h.LojaId == lojaId.Value)
            .Select(h => new
            {
                h.Id,
                h.UsuarioId,
                h.ProdutoId,
                h.DataHora,
                Usuario = h.Usuario == null
                    ? null
                    : new
                    {
                        h.Usuario.Id,
                        h.Usuario.Nome,
                        h.Usuario.Email,
                        h.Usuario.Role
                    },
                Produto = h.Produto == null
                    ? null
                    : new
                    {
                        h.Produto.Id,
                        h.Produto.Nome,
                        h.Produto.Preco
                    }
            })
            .SingleOrDefault();

        if (horario == null)
        {
            return NotFound("Horário não encontrado.");
        }
        return Ok(horario);
    }

    [HttpPost]
    public IActionResult CreateHorario([FromBody] Horarios horario)
    {
        if (horario == null || horario.UsuarioId <= 0 || horario.ProdutoId <= 0 || horario.DataHora == default)
        {
            return BadRequest("UsuarioId, ProdutoId e DataHora são obrigatórios.");
        }

        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return BadRequest("Não foi possível identificar a loja para este usuário.");
        }

        var role = GetCurrentUserRole();
        var currentUserId = GetCurrentUserId();
        if (!IsStoreRole(role) && (currentUserId == null || horario.UsuarioId != currentUserId.Value))
        {
            return Forbid();
        }

        if (!_context.Users.Any(u => u.Id == horario.UsuarioId))
        {
            return BadRequest("Usuário não encontrado. Crie o usuário primeiro.");
        }

        if (!_context.Products.Any(p => p.Id == horario.ProdutoId))
        {
            return BadRequest("Produto não encontrado.");
        }

        if (!_context.Users.Any(u => u.Id == horario.UsuarioId && (u.LojaId == lojaId.Value || u.Id == lojaId.Value)))
        {
            return BadRequest("Usuário não pertence à loja autenticada.");
        }

        if (!_context.Products.Any(p => p.Id == horario.ProdutoId && p.LojaId == lojaId.Value))
        {
            return BadRequest("Produto não pertence à loja autenticada.");
        }

        horario.LojaId = lojaId.Value;

        _context.Horarios.Add(horario);
        _context.SaveChanges();

        var createdHorario = _context.Horarios
            .AsNoTracking()
            .Where(h => h.Id == horario.Id && h.LojaId == lojaId.Value)
            .Select(h => new
            {
                h.Id,
                h.UsuarioId,
                h.ProdutoId,
                h.DataHora,
                Usuario = h.Usuario == null
                    ? null
                    : new
                    {
                        h.Usuario.Id,
                        h.Usuario.Nome,
                        h.Usuario.Email,
                        h.Usuario.Role
                    },
                Produto = h.Produto == null
                    ? null
                    : new
                    {
                        h.Produto.Id,
                        h.Produto.Nome,
                        h.Produto.Preco
                    }
            })
            .Single();

        return CreatedAtAction(nameof(GetHorario), new { id = horario.Id }, createdHorario);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateHorario(int id, [FromBody] Horarios horario)
    {
        if (horario == null || horario.UsuarioId <= 0 || horario.ProdutoId <= 0 || horario.DataHora == default)
        {
            return BadRequest("UsuarioId, ProdutoId e DataHora são obrigatórios.");
        }

        var role = GetCurrentUserRole();
        if (!IsStoreRole(role))
        {
            return Forbid();
        }

        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return BadRequest("Não foi possível identificar a loja para este usuário.");
        }

        var existingHorario = _context.Horarios.SingleOrDefault(h => h.Id == id && h.LojaId == lojaId.Value);
        if (existingHorario == null)
        {
            return NotFound("Horário não encontrado.");
        }

        if (!_context.Users.Any(u => u.Id == horario.UsuarioId && (u.LojaId == lojaId.Value || u.Id == lojaId.Value)))
        {
            return BadRequest("Usuário não pertence à loja autenticada.");
        }

        if (!_context.Products.Any(p => p.Id == horario.ProdutoId && p.LojaId == lojaId.Value))
        {
            return BadRequest("Produto não pertence à loja autenticada.");
        }

        existingHorario.UsuarioId = horario.UsuarioId;
        existingHorario.ProdutoId = horario.ProdutoId;
        existingHorario.DataHora = horario.DataHora;
        existingHorario.LojaId = lojaId.Value;
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteHorario(int id)
    {
        var role = GetCurrentUserRole();
        var currentUserId = GetCurrentUserId();
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Horário não encontrado.");
        }

        var horario = _context.Horarios.SingleOrDefault(h => h.Id == id && h.LojaId == lojaId.Value);
        if (horario == null)
        {
            return NotFound("Horário não encontrado.");
        }

        if (!IsStoreRole(role) && (currentUserId == null || horario.UsuarioId != currentUserId.Value))
        {
            return Forbid();
        }

        _context.Horarios.Remove(horario);
        _context.SaveChanges();
        return NoContent();
    }

    [HttpPatch("{id}/remarcar")]
    public IActionResult RemarcarHorario(int id, [FromBody] RemarcarHorarioRequest request)
    {
        if (request == null || request.DataHora == default)
        {
            return BadRequest("DataHora é obrigatória para remarcar o horário.");
        }

        var horario = _context.Horarios.Find(id);
        if (horario == null)
        {
            return NotFound("Horário não encontrado.");
        }

        var lojaId = GetScopeLojaId();
        if (lojaId == null || horario.LojaId != lojaId.Value)
        {
            return NotFound("Horário não encontrado.");
        }

        var role = GetCurrentUserRole();
        var userId = GetCurrentUserId();

        if (!IsStoreRole(role) && (userId == null || horario.UsuarioId != userId.Value))
        {
            return Forbid();
        }

        horario.DataHora = request.DataHora;
        _context.SaveChanges();

        var updatedHorario = _context.Horarios
            .AsNoTracking()
            .Where(h => h.Id == id && h.LojaId == lojaId.Value)
            .Select(h => new
            {
                h.Id,
                h.UsuarioId,
                h.ProdutoId,
                h.DataHora,
                Usuario = h.Usuario == null
                    ? null
                    : new
                    {
                        h.Usuario.Id,
                        h.Usuario.Nome,
                        h.Usuario.Email,
                        h.Usuario.Role
                    },
                Produto = h.Produto == null
                    ? null
                    : new
                    {
                        h.Produto.Id,
                        h.Produto.Nome,
                        h.Produto.Preco
                    }
            })
            .Single();

        return Ok(updatedHorario);
    }

    private int? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(idClaim, out var userId) ? userId : null;
    }

    private string GetCurrentUserRole()
    {
        return (User.FindFirstValue(ClaimTypes.Role) ?? string.Empty).Trim().ToLowerInvariant();
    }

    private static bool IsStoreRole(string role)
    {
        return role == "loja" || role == "funcionario" || role == "vendedor";
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

        var role = (user.Role ?? string.Empty).Trim().ToLowerInvariant();
        if (role == "loja")
        {
            return user.LojaId ?? user.Id;
        }

        return user.LojaId;
    }
}