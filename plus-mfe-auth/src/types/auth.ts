// Contratos do microsserviço de autenticação (via API Gateway)

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  refresh: string;
  user?: User;
}

export interface RefreshResponse {
  token: string;
  refresh: string;
}

export interface AuthErrorBody {
  error: string;
  statusCode?: number;
}
