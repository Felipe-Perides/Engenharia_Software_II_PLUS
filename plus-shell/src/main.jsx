import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// StrictMode removido: em dev remonta filhos e, com login + navigate, pode
// combinar mal com o batching do estado da sessão no shell.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
