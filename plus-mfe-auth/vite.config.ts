import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Obrigatório coincidir com plus-shell (@originjs). @module-federation/vite gera remote incompatível → shell fica branco após "Carregando...".
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_auth",
      filename: "remoteEntry.js",
      exposes: {
        "./LoginPage": "./src/pages/LoginPage.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 4001,
    host: true,
    origin: "http://localhost:4001",
    cors: true,
  },
  preview: {
    port: 4001,
    host: true,
  },
});
