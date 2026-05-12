import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

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
      shared: {
        react: { singleton: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
        "@mui/material": { singleton: true },
        "@emotion/react": { singleton: true },
        "@emotion/styled": { singleton: true },
      },
    }),
  ],
  build: {
    // Chrome 89+ é exigido pelo runtime do Module Federation (usa TLA).
    target: "chrome89",
    minify: false,
  },
  server: {
    port: 4001,
    host: true,
    // Necessário para que os assets do remoteEntry resolvam URLs absolutas em dev.
    origin: "http://localhost:4001",
  },
  preview: {
    port: 4001,
    host: true,
  },
});
