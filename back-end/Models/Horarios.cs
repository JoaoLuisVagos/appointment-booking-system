using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models;

[Table("horarios")]
public class Horarios
{
    [Column("id")]
    public int Id { get; set; }

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("produto_id")]
    public int ProdutoId { get; set; }

    [Column("data_hora")]
    public DateTime DataHora { get; set; }

    public User? Usuario { get; set; }
    public Products? Produto { get; set; }
}