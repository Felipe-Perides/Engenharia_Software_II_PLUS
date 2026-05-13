// Camada única de persistência do par access/refresh token.
// Centralizar aqui facilita trocar localStorage por sessionStorage,
// cookie httpOnly, ou qualquer outro mecanismo no futuro.

const TOKEN_KEY = "plus.auth.token";
const REFRESH_KEY = "plus.auth.refresh";

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens(token: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  hasSession(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
