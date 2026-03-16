using Microsoft.AspNetCore.Mvc;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var products = _context.Products.ToList();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public IActionResult GetProduct(int id)
    {
        var product = _context.Products.Find(id);
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

        var existingProduct = _context.Products.Find(id);
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
        var product = _context.Products.Find(id);
        if (product == null)
        {
            return NotFound("Produto não encontrado.");
        }

        _context.Products.Remove(product);
        _context.SaveChanges();
        return NoContent();
    }
}