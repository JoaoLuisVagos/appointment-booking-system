using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly BookingContext _context;

    public ProductsController(BookingContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetProducts()
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return Ok(Array.Empty<Products>());
        }

        var products = _context.Products
            .Where(p => p.LojaId == lojaId.Value)
            .ToList();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public IActionResult GetProduct(int id)
    {
        var lojaId = GetScopeLojaId();
        if (lojaId == null)
        {
            return NotFound("Produto não encontrado.");
        }

        var product = _context.Products.SingleOrDefault(p => p.Id == id && p.LojaId == lojaId.Value);
        if (product == null)
        {
            return NotFound("Produto não encontrado.");
        }
        return Ok(product);
    }

    [HttpPost]
    public IActionResult CreateProduct([FromBody] Products product)
    {
        if (product == null || string.IsNullOrEmpty(product.Nome) || product.Preco <= 0)
        {
            return BadRequest("Nome e Preço são obrigatórios e Preço deve ser maior que zero.");
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

        product.LojaId = lojaId.Value;

        _context.Products.Add(product);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateProduct(int id, [FromBody] Products product)
    {
        if (product == null || string.IsNullOrEmpty(product.Nome) || product.Preco <= 0)
        {
            return BadRequest("Nome e Preço são obrigatórios e Preço deve ser maior que zero.");
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

        var existingProduct = _context.Products.SingleOrDefault(p => p.Id == id && p.LojaId == lojaId.Value);
        if (existingProduct == null)
        {
            return NotFound("Produto não encontrado.");
        }

        existingProduct.Nome = product.Nome;
        existingProduct.Preco = product.Preco;
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteProduct(int id)
    {
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

        var product = _context.Products.SingleOrDefault(p => p.Id == id && p.LojaId == lojaId.Value);
        if (product == null)
        {
            return NotFound("Produto não encontrado.");
        }

        _context.Products.Remove(product);
        _context.SaveChanges();
        return NoContent();
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

    private static bool IsStoreRole(string role)
    {
        return role == "loja" || role == "funcionario" || role == "vendedor";
    }

    private static string NormalizeRole(string? role)
    {
        return (role ?? string.Empty).Trim().ToLowerInvariant();
    }
}