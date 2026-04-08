using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace back_end.Models;

[Table("usuarios")]
public class User
{
    [Column("id")]
    public int Id { get; set; }
    
    [Column("nome")]
    public string Nome { get; set; } = string.Empty;
    
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    [Column("senha_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = "cliente";

    [Column("loja_id")]
    public int? LojaId { get; set; }

    [Column("telefone")]
    public string? Telefone { get; set; }

    [Column("endereco")]
    public string? Endereco { get; set; }

    [Column("cidade")]
    public string? Cidade { get; set; }

    [Column("estado")]
    public string? Estado { get; set; }

    [Column("cep")]
    public string? Cep { get; set; }

    [Column("complemento")]
    public string? Complemento { get; set; }

    public ICollection<Horarios> Horarios { get; set; } = new List<Horarios>();
}