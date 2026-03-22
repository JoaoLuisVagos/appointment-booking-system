using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using back_end.Data;
using back_end.Models;

namespace back_end.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BookingContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(BookingContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "cliente" : request.Role
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var token = GenerateJwtToken(user);
        return Created(string.Empty, new AuthResponse(token, user.Id, user.Nome, user.Email, user.Role));
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest("Email e Senha são obrigatórios.");
        }

        var user = _context.Users.SingleOrDefault(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Senha, user.PasswordHash))
        {
            return Unauthorized("Email ou senha inválidos.");
        }

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Nome, user.Email, user.Role));
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key não configurado.");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "appointment-booking-system";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "appointment-booking-system";

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Nome),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(1);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
