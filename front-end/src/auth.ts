import { AuthResponse, AuthState } from "./types";

const STORAGE_KEY = "booking_app_auth";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000/api";

export function loadAuth(): AuthState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as AuthState;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState | null) {
  if (!auth) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function buildAuthHeaders(auth?: AuthState): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = auth?.token ?? loadAuth()?.token;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function login(email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Falha ao fazer login");
  }
  return (await res.json()) as AuthResponse;
}

export async function register(
  nome: string,
  email: string,
  senha: string,
  role: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ nome, email, senha, role }),
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Falha ao registrar");
  }
  return (await res.json()) as AuthResponse;
}
