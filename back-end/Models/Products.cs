using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models;

[Table("produtos")]
public class Products
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("preco")]
    public decimal Preco { get; set; }

    [Column("loja_id")]
    public int? LojaId { get; set; }

    public ICollection<Horarios> Horarios { get; set; } = new List<Horarios>();
}