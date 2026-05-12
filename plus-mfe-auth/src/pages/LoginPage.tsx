import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { login } from "../api/authClient";
import type { LoginResponse } from "../types/auth";

export interface LoginPageProps {
  onLogin?: (data: LoginResponse) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login({ email, password });
      onLogin?.(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ mb: 3, fontWeight: 600 }}
        >
          Plus — Entrar
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError ?? " "}
            disabled={loading}
            autoComplete="email"
            autoFocus
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError ?? " "}
            disabled={loading}
            autoComplete="current-password"
          />

          {submitError && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
              {submitError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Entrar"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
