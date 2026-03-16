using System.ComponentModel.DataAnnotations.Schema;

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

    public ICollection<Horarios> Horarios { get; set; } = new List<Horarios>();
}