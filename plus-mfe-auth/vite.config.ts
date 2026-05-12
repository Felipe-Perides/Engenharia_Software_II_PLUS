import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_auth",
      filename: "remoteEntry.js",
      // Componentes expostos para o Shell consumir
      exposes: {
        "./LoginPage": "./src/pages/LoginPage.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled",
      ],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 4001,
    host: true,
  },
  preview: {
    port: 4001,
    host: true,
  },
});
