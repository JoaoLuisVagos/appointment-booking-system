using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace back_end.Models;

[Table("lojas")]
public class Loja
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = "BookingApp";

    [Column("telefone")]
    public string? Telefone { get; set; }

    [Column("endereco")]
    public string? Endereco { get; set; }

    [Column("cor_primaria")]
    public string CorPrimaria { get; set; } = "#0e7490";

    [Column("cor_secundaria_fonte")]
    public string CorSecundariaFonte { get; set; } = "#5f6f82";

    [Column("logo_url")]
    public string? LogoUrl { get; set; }

    [Column("usuario_admin_id")]
    public int? UsuarioAdminId { get; set; }
}
