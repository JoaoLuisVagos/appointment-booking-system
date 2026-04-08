namespace back_end.Models;

public record RegisterRequest(
    string Nome,
    string Email,
    string Senha,
    string Role,
    int? LojaId);

public record LoginRequest(
    string Email,
    string Senha);

public record AuthResponse(
    string Token,
    int UserId,
    string Nome,
    string Email,
    string Role,
    int? LojaId);

public record RemarcarHorarioRequest(
    DateTime DataHora);

public record ClientePerfilResponse(
    int Id,
    string Nome,
    string Email,
    string Telefone,
    string Endereco,
    string Cidade,
    string Estado,
    string Cep,
    string Complemento);

public record UpdateClientePerfilRequest(
    string Telefone,
    string Endereco,
    string Cidade,
    string Estado,
    string Cep,
    string Complemento);