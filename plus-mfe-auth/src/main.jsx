import React from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./pages/LoginPage";

// Ponto de entrada standalone (desenvolvimento isolado)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoginPage onLogin={(data) => console.log("Logado:", data)} />
  </React.StrictMode>
);
