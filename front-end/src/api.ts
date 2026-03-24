import { AuthState, Horario, Product, User } from "./types";
import { API_BASE, buildAuthHeaders, extractApiErrorMessage, safeFetch } from "./auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
  return (await res.json()) as T;
}

export async function getProducts(auth?: AuthState): Promise<Product[]> {
  const res = await safeFetch(`${API_BASE}/products`, {
    method: "GET",
    headers: buildAuthHeaders(auth),
  });
  return handleResponse<Product[]>(res);
}

export async function createProduct(
  data: { nome: string; preco: number },
  auth?: AuthState
): Promise<Product> {
  const res = await safeFetch(`${API_BASE}/products`, {
    method: "POST",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

export async function deleteProduct(id: number, auth?: AuthState): Promise<void> {
  const res = await safeFetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(auth),
  });
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
}

export async function getHorarios(auth?: AuthState): Promise<Horario[]> {
  const res = await safeFetch(`${API_BASE}/horarios`, {
    method: "GET",
    headers: buildAuthHeaders(auth),
  });
  return handleResponse<Horario[]>(res);
}

export async function createHorario(
  data: { usuarioId: number; produtoId: number; dataHora: string },
  auth?: AuthState
): Promise<Horario> {
  const res = await safeFetch(`${API_BASE}/horarios`, {
    method: "POST",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  return handleResponse<Horario>(res);
}

export async function getUsers(auth?: AuthState): Promise<User[]> {
  const res = await safeFetch(`${API_BASE}/users`, {
    method: "GET",
    headers: buildAuthHeaders(auth),
  });
  return handleResponse<User[]>(res);
}
