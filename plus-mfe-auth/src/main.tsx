import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import LoginPage from "./pages/LoginPage";
import { tokenStorage } from "./utils/tokenStorage";

const theme = createTheme({
  palette: { mode: "light" },
});

function StandaloneApp() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    return (
      <Box sx={{ p: 4, maxWidth: 480, mx: "auto", mt: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sessão iniciada
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Tokens guardados nesta origem. O fluxo completo corre no shell (porta
          3000).
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            tokenStorage.clear();
            setLoggedIn(false);
          }}
        >
          Sair
        </Button>
      </Box>
    );
  }

  return <LoginPage onLogin={() => setLoggedIn(true)} />;
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Elemento #root não encontrado");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StandaloneApp />
    </ThemeProvider>
  </React.StrictMode>
);
