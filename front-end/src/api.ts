import { AuthState, Horario, Product, User } from "./types";
import { API_BASE, buildAuthHeaders, extractApiErrorMessage, safeFetch } from "./auth";
import { DEFAULT_STORE_SETTINGS, StoreSettings } from "./storeSettings";

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

export async function remarcarHorario(
  id: number,
  dataHora: string,
  auth?: AuthState
): Promise<Horario> {
  const res = await safeFetch(`${API_BASE}/horarios/${id}/remarcar`, {
    method: "PATCH",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify({ dataHora }),
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

export async function createUser(
  data: { nome: string; email: string; senha: string; role: "funcionario" | "cliente" },
  auth?: AuthState
): Promise<User> {
  const res = await safeFetch(`${API_BASE}/users`, {
    method: "POST",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  return handleResponse<User>(res);
}

export async function updateUser(
  id: number,
  data: { nome: string; email: string },
  auth?: AuthState
): Promise<void> {
  const res = await safeFetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
}

export async function deleteUser(id: number, auth?: AuthState): Promise<void> {
  const res = await safeFetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(auth),
  });
  if (!res.ok) {
    throw new Error(await extractApiErrorMessage(res));
  }
}

type LojaSettingsResponse = {
  nomeLoja: string;
  telefone: string;
  endereco: string;
  primaryColor: string;
  logoUrl: string;
};

function toStoreSettings(data: Partial<LojaSettingsResponse>): StoreSettings {
  return {
    nomeLoja: data.nomeLoja?.trim() || DEFAULT_STORE_SETTINGS.nomeLoja,
    telefone: data.telefone?.trim() || "",
    endereco: data.endereco?.trim() || "",
    primaryColor: data.primaryColor || DEFAULT_STORE_SETTINGS.primaryColor,
    logoUrl: data.logoUrl?.trim() || "",
  };
}

export async function getMinhaLojaSettings(auth?: AuthState): Promise<StoreSettings> {
  const res = await safeFetch(`${API_BASE}/lojas/minha-loja`, {
    method: "GET",
    headers: buildAuthHeaders(auth),
  });
  const data = await handleResponse<LojaSettingsResponse>(res);
  return toStoreSettings(data);
}

export async function updateMinhaLojaSettings(
  data: StoreSettings,
  auth?: AuthState
): Promise<StoreSettings> {
  const res = await safeFetch(`${API_BASE}/lojas/minha-loja`, {
    method: "PUT",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  const updated = await handleResponse<LojaSettingsResponse>(res);
  return toStoreSettings(updated);
}

export type ClientePerfil = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento: string;
};

export async function getMeuPerfilCliente(auth?: AuthState): Promise<ClientePerfil> {
  const res = await safeFetch(`${API_BASE}/users/meu-perfil`, {
    method: "GET",
    headers: buildAuthHeaders(auth),
  });
  return handleResponse<ClientePerfil>(res);
}

export async function updateMeuPerfilCliente(
  data: Omit<ClientePerfil, "id" | "nome" | "email">,
  auth?: AuthState
): Promise<ClientePerfil> {
  const res = await safeFetch(`${API_BASE}/users/meu-perfil`, {
    method: "PUT",
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(data),
  });
  return handleResponse<ClientePerfil>(res);
}
