import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import type { LoginResponse } from "./types/auth";

// Ponto de entrada standalone (desenvolvimento isolado).
// Quando consumido pelo Shell via Module Federation, este arquivo não é usado.

const theme = createTheme({
  palette: { mode: "light" },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Elemento #root não encontrado");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginPage
        onLogin={(data: LoginResponse) => console.log("Logado:", data)}
      />
    </ThemeProvider>
  </React.StrictMode>
);
