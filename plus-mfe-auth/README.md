# plus-mfe-auth

Microfrontend de autenticação do projeto **Plus**.

Expõe o componente `LoginPage` via **Module Federation** para ser consumido
pelo `plus-shell`. Construído com React + TypeScript + Vite + Material UI.

---

## Tecnologias

- React 18
- TypeScript 5
- Vite 8 (Rolldown)
- Material UI v5 + Emotion
- `@module-federation/vite` — Module Federation oficial
- `@vitejs/plugin-react` v6
- Vitest + Testing Library

---

## Module Federation

Este microfrontend atua como **remote**:

| Propriedade | Valor |
|---|---|
| Nome | `mfe_auth` |
| Entry point | `http://localhost:4001/remoteEntry.js` |
| Expõe | `./LoginPage` → `src/pages/LoginPage.tsx` |
| Shared (singleton) | `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled` |

### Consumo no Shell

Configuração do `vite.config.ts` do host:

```typescript
import { federation } from "@module-federation/vite";

federation({
  name: "shell",
  remotes: {
    mfe_auth: {
      type: "module",
      name: "mfe_auth",
      entry: "http://localhost:4001/remoteEntry.js",
    },
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "@mui/material": { singleton: true },
    "@emotion/react": { singleton: true },
    "@emotion/styled": { singleton: true },
  },
})
```

E no código React:

```tsx
const LoginPage = React.lazy(() => import("mfe_auth/LoginPage"));

<Suspense fallback={<Loading />}>
  <LoginPage onLogin={(data) => /* salvar sessão e redirecionar */} />
</Suspense>
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_MS_AUTH_URL` | URL do API Gateway que expõe o `plus-ms-auth` (ex: `http://localhost:4566/restapis/<api-id>/<stage>/_user_request_`) |

Copie `.env.example` para `.env` e ajuste a URL conforme o ambiente.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo dev na porta 4001 |
| `npm run build` | Type-check + bundle em `dist/` |
| `npm run preview` | Serve o build local na porta 4001 |
| `npm run test` | Roda os testes em watch mode |
| `npm run test:run` | Roda os testes uma vez (CI) |
| `npm run test:coverage` | Roda os testes com relatório de cobertura |
| `npm run type-check` | Apenas `tsc --noEmit` |

---

## Desenvolvimento local

```bash
npm install
cp .env.example .env   # ajustar VITE_MS_AUTH_URL
npm run dev
```

Acesse: http://localhost:4001

Em modo standalone, o `main.tsx` apenas faz `console.log` no `onLogin` —
útil para iterar na UI sem o Shell.

---

## Testes

Stack: **Vitest** + **@testing-library/react** + **jsdom**.

```bash
npm run test           # watch
npm run test:run       # one-shot
npm run test:coverage  # com cobertura HTML em coverage/
```

Os testes vivem em `src/**/__tests__/*.test.tsx` e mockam o `authClient`
para isolar a UI das chamadas de rede.

---

## Docker

```bash
# Build
docker build \
  --build-arg VITE_MS_AUTH_URL=http://localhost:4566/restapis/abc123/local/_user_request_ \
  -t plus-mfe-auth .

# Run
docker run -p 4001:4001 plus-mfe-auth
```

A imagem é multi-stage: builda com Node 20 e serve estático via Nginx
Alpine. O Nginx vem com CORS aberto (essencial para o Shell baixar o
`remoteEntry.js`) e cache desativado especificamente para o `remoteEntry.js`.

---

## CI/CD

Pipeline em `.github/workflows/ci.yml`:

1. Instalação de dependências (`npm ci`)
2. Type-check (`tsc --noEmit`)
3. Testes (`vitest run`)
4. Build do Vite
5. Build da imagem Docker

Roda em `push` e `pull_request` nos branches `main` e `develop`.

---

## Estrutura

plus-mfe-auth/
├── .dockerignore
├── .github/workflows/ci.yml
├── docs/
│   └── UI_MANUAL.md
├── src/
│   ├── api/authClient.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── tests/LoginPage.test.tsx
│   ├── test/setup.ts
│   ├── types/auth.ts
│   ├── utils/tokenStorage.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── Dockerfile
├── nginx.conf
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o
[README do plus-infra](https://github.com/pucrs-sweii-2026-1-30/plus-infra)
para subir LocalStack, MS de auth, Shell e MFEs juntos.

## Documentação relacionada

- [Manual de UI](./docs/UI_MANUAL.md) — fluxo de login, componentes MUI e
  estados visuais
