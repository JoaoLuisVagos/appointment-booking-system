using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        var horarios = _context.Horarios.ToList();
        return Ok(horarios);
    }

    [HttpGet("{id}")]
    public IActionResult GetHorario(int id)
    {
        var horario = _context.Horarios.Find(id);
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

        // Validação: Verificar se o usuário existe
        if (!_context.Users.Any(u => u.Id == horario.UsuarioId))
        {
            return BadRequest("Usuário não encontrado. Crie o usuário primeiro.");
        }

        // Validação: Verificar se o produto existe
        if (!_context.Products.Any(p => p.Id == horario.ProdutoId))
        {
            return BadRequest("Produto não encontrado.");
        }

        _context.Horarios.Add(horario);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetHorario), new { id = horario.Id }, horario);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateHorario(int id, [FromBody] Horarios horario)
    {
        if (horario == null || horario.UsuarioId <= 0 || horario.ProdutoId <= 0 || horario.DataHora == default)
        {
            return BadRequest("UsuarioId, ProdutoId e DataHora são obrigatórios.");
        }

        var existingHorario = _context.Horarios.Find(id);
        if (existingHorario == null)
        {
            return NotFound("Horário não encontrado.");
        }

        existingHorario.UsuarioId = horario.UsuarioId;
        existingHorario.ProdutoId = horario.ProdutoId;
        existingHorario.DataHora = horario.DataHora;
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteHorario(int id)
    {
        var horario = _context.Horarios.Find(id);
        if (horario == null)
        {
            return NotFound("Horário não encontrado.");
        }

        _context.Horarios.Remove(horario);
        _context.SaveChanges();
        return NoContent();
    }
}