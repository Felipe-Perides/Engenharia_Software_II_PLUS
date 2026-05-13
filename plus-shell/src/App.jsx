import { useState, useCallback } from "react";
import ShellLoginPage from "./ShellLoginPage";

const ACCESS_TOKEN_KEY = "plus.auth.token";
const REFRESH_TOKEN_KEY = "plus.auth.refresh";

function hasStoredSession() {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

function Dashboard({ onLogout }) {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Plus — Dashboard</h1>
      <p>Bem-vindo ao sistema de gestão de estoque.</p>
      <button type="button" onClick={onLogout}>
        Sair
      </button>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => hasStoredSession());

  const handleLoggedIn = useCallback((token, refresh) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    setAuthed(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAuthed(false);
  }, []);

  if (authed) {
    return <Dashboard onLogout={handleLogout} />;
  }
  return <ShellLoginPage onLoggedIn={handleLoggedIn} />;
}
