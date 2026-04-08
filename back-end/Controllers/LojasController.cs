using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LojasController : ControllerBase
{
    private readonly BookingContext _context;

    public LojasController(BookingContext context)
    {
        _context = context;
    }

    [HttpGet("minha-loja")]
    public IActionResult GetMinhaLoja()
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Loja não encontrada.");
        }

        var loja = _context.Lojas.SingleOrDefault(l => l.Id == lojaId.Value);
        if (loja == null)
        {
            return NotFound("Loja não encontrada.");
        }

        return Ok(ToResponse(loja));
    }

    [HttpPut("minha-loja")]
    public IActionResult UpdateMinhaLoja([FromBody] UpdateLojaRequest request)
    {
        if (!IsLojaOwnerRole(GetCurrentUserRole()))
        {
            return Forbid();
        }

        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Loja não encontrada.");
        }

        var loja = _context.Lojas.SingleOrDefault(l => l.Id == lojaId.Value);
        if (loja == null)
        {
            return NotFound("Loja não encontrada.");
        }

        loja.Nome = string.IsNullOrWhiteSpace(request.NomeLoja) ? "BookingApp" : request.NomeLoja.Trim();
        loja.Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();
        loja.Endereco = string.IsNullOrWhiteSpace(request.Endereco) ? null : request.Endereco.Trim();
        loja.CorPrimaria = NormalizeHexColor(request.PrimaryColor);
        loja.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl.Trim();

        _context.SaveChanges();

        return Ok(ToResponse(loja));
    }

    private static object ToResponse(Loja loja)
    {
        return new
        {
            loja.Id,
            NomeLoja = string.IsNullOrWhiteSpace(loja.Nome) ? "BookingApp" : loja.Nome,
            Telefone = loja.Telefone ?? string.Empty,
            Endereco = loja.Endereco ?? string.Empty,
            PrimaryColor = NormalizeHexColor(loja.CorPrimaria),
            LogoUrl = loja.LogoUrl ?? string.Empty
        };
    }

    private static string NormalizeHexColor(string? color)
    {
        if (string.IsNullOrWhiteSpace(color))
        {
            return "#0e7490";
        }

        var value = color.Trim();
        return System.Text.RegularExpressions.Regex.IsMatch(value, "^#([A-Fa-f0-9]{6})$")
            ? value
            : "#0e7490";
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

    private static bool IsLojaOwnerRole(string role)
    {
        return role == "loja";
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
            .Select(u => new { u.LojaId })
            .SingleOrDefault();

        return user?.LojaId;
    }
}

public record UpdateLojaRequest(
    string NomeLoja,
    string Telefone,
    string Endereco,
    string PrimaryColor,
    string LogoUrl);
