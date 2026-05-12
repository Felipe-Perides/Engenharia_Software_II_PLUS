import type {
  AuthErrorBody,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
} from "../types/auth";
import { tokenStorage } from "../utils/tokenStorage";

const BASE_URL =
  import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };

  if (auth) {
    const token = tokenStorage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Falha na requisição (${res.status})`;
    try {
      const body = (await res.json()) as AuthErrorBody;
      if (body.error) message = body.error;
    } catch {
      // resposta sem JSON — mantém mensagem genérica
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  tokenStorage.setTokens(data.token, data.refresh);
  return data;
}

export async function refresh(): Promise<RefreshResponse> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("Sem refresh token");

  const data = await request<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
  tokenStorage.setTokens(data.token, data.refresh);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/auth/logout", { method: "POST" }, true);
  } finally {
    // Mesmo se o MS falhar, limpamos local — sessão expirada do lado do cliente.
    tokenStorage.clear();
  }
}

export async function me(): Promise<User> {
  return request<User>("/auth/me", { method: "GET" }, true);
}
