import { AuthResponse, AuthState } from "./types";

const STORAGE_KEY = "booking_app_auth";

const DEV_API_BASE = "http://localhost:5000/api";
const PROD_API_BASE = "https://appointment-booking-system-tjfd.onrender.com/api";

function resolveApiBase(): string {
  const explicitApiBase = import.meta.env.VITE_API_BASE?.trim();
  if (explicitApiBase) return explicitApiBase;

  const hostname = window.location.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  return isLocalHost ? DEV_API_BASE : PROD_API_BASE;
}

export const API_BASE = resolveApiBase();

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

type ApiErrorBody = {
  message?: string;
  detail?: string;
  title?: string;
};

async function extractApiErrorMessage(res: Response): Promise<string> {
  const fallback = `Erro ${res.status}: ${res.statusText || "falha na requisicao"}`;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await res.json()) as ApiErrorBody;
      return body.message || body.detail || body.title || fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const text = (await res.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.");
  }
}

export async function login(email: string, senha: string): Promise<AuthResponse> {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
  return (await res.json()) as AuthResponse;
}

export async function register(
  nome: string,
  email: string,
  senha: string,
  role: string,
  lojaId?: number
): Promise<AuthResponse> {
  const res = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ nome, email, senha, role, lojaId }),
  });
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
  return (await res.json()) as AuthResponse;
}

export { extractApiErrorMessage, safeFetch };
