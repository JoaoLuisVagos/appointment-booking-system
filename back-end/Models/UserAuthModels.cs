namespace back_end.Models;

public record RegisterRequest(
    string Nome,
    string Email,
    string Senha,
    string Role);

public record LoginRequest(
    string Email,
    string Senha);

public record AuthResponse(
    string Token,
    int UserId,
    string Nome,
    string Email,
    string Role);