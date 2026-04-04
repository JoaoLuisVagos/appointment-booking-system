export type UserRole = "cliente" | "loja" | "funcionario" | "vendedor";

export interface AuthResponse {
  token: string;
  userId: number;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AuthState extends AuthResponse {}

export interface Product {
  id: number;
  nome: string;
  preco: number;
}

export interface Horario {
  id: number;
  usuarioId: number;
  produtoId: number;
  dataHora: string;
  usuario?: { nome: string };
  produto?: { nome: string };
}

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}
