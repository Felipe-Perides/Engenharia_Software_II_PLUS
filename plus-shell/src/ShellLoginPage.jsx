import { useState } from "react";

const MS_AUTH_BASE =
  import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShellLoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let ok = true;
    if (!email.trim()) {
      setEmailError("E-mail é obrigatório");
      ok = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("E-mail inválido");
      ok = false;
    } else {
      setEmailError(null);
    }
    if (!password) {
      setPasswordError("Senha é obrigatória");
      ok = false;
    } else if (password.length < 4) {
      setPasswordError("Senha muito curta (mín. 4 caracteres)");
      ok = false;
    } else {
      setPasswordError(null);
    }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${MS_AUTH_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : `Falha na requisição (${res.status})`;
        throw new Error(msg);
      }
      const token = body.token;
      const refresh = body.refresh;
      if (typeof token !== "string" || !token) {
        throw new Error("Resposta inválida: sem token.");
      }
      onLoggedIn(token, typeof refresh === "string" ? refresh : "");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ margin: "0 0 24px", fontSize: "1.25rem", fontWeight: 600 }}>
          Plus — Entrar
        </h1>
        <form onSubmit={handleSubmit} noValidate>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={loading}
              autoComplete="email"
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "10px 12px",
                border: `1px solid ${emailError ? "#c62828" : "#ccc"}`,
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </label>
          {emailError ? (
            <p style={{ color: "#c62828", fontSize: 13, margin: "0 0 12px" }}>
              {emailError}
            </p>
          ) : null}

          <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={loading}
              autoComplete="current-password"
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "10px 12px",
                border: `1px solid ${passwordError ? "#c62828" : "#ccc"}`,
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </label>
          {passwordError ? (
            <p style={{ color: "#c62828", fontSize: 13, margin: "0 0 12px" }}>
              {passwordError}
            </p>
          ) : null}

          {submitError ? (
            <p
              role="alert"
              style={{
                color: "#c62828",
                fontSize: 14,
                margin: "12px 0",
                padding: 12,
                background: "#ffebee",
                borderRadius: 4,
              }}
            >
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px 16px",
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              background: loading ? "#90a4ae" : "#1976d2",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
