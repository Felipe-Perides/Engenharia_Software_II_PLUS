# plus-mfe-auth

Microfrontend de autenticação do projeto **Plus**.

Expõe o componente `LoginPage` via **Module Federation** para ser consumido
pelo `plus-shell`. Construído com React + TypeScript + Vite + Material UI.

Contexto arquitectural e limitações locais (CORS no Gateway, evento `plus-auth-login-success`): [**ADR-0001**](../ADR-0001-arquitetura-stack-plus.md).

---

## Tecnologias

- React 18
- TypeScript 5
- Vite 5 (Vite 8 + Rolldown falha o build com `@originjs/vite-plugin-federation` + MUI)
- Material UI v5 + Emotion
- `@originjs/vite-plugin-federation` — alinhado com o `plus-shell` (CHECKLIST)
- `@vitejs/plugin-react` v4
- Vitest + Testing Library

---

## Module Federation

Este microfrontend atua como **remote**:

| Propriedade | Valor |
|---|---|
| Nome | `mfe_auth` |
| Entry point | `http://localhost:4001/assets/remoteEntry.js` |
| Expõe | `./LoginPage` → `src/pages/LoginPage.tsx` |
| Shared | `react`, `react-dom` apenas (MUI e Emotion ficam no bundle do remote) |

### Consumo no Shell

O `plus-shell` usa o mesmo **`@originjs/vite-plugin-federation`**. Exemplo mínimo:

```typescript
import federation from "@originjs/vite-plugin-federation";

federation({
  name: "shell",
  remotes: {
    mfe_auth: "http://localhost:4001/assets/remoteEntry.js",
  },
  shared: ["react", "react-dom"],
})
```

E no código React:

```tsx
const LoginPage = React.lazy(() => import("mfe_auth/LoginPage"));

<Suspense fallback={<Loading />}>
  <LoginPage
    onLogin={(data) => {
      // Caminho preferencial quando a prop atravessa o remote.
      // O MFE também emite `plus-auth-login-success` em `window` após login.
    }}
  />
</Suspense>
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_MS_AUTH_URL` | URL **base** do `fetch` (prefixo antes de `/auth/login`, etc.). Em dev local, costuma ser o API Gateway (`4566/.../_user_request_`) ou `http://localhost:3001` se quiseres evitar CORS no browser. |

Copie `.env.example` para `.env` e ajuste a URL conforme o ambiente.

### Gateway (Terraform) vs MS directo no browser (local)

O `make setup` no `plus-infra` grava no `.env` o URL do **API Gateway** (`VITE_MS_AUTH_URL`) a partir do Terraform — referência correcta para a stack. Em **Docker**, o build do MFE usa por omissão **`VITE_MS_AUTH_BROWSER`** (ver `plus-infra/docker-compose.yml`) apontando para **`http://localhost:3001`**, para o browser falar **directamente** com o `plus-ms-auth`: o Gateway em **LocalStack** (`4566`) muitas vezes **não** devolve cabeçalhos CORS utilizáveis entre origens `localhost:3000` / `4001` e `4566`, e o `fetch` falha com *Failed to fetch* apesar do MS estar bem. O mesmo critério está documentado no **CHECKLIST** (nota ao item 20). Para forçar o Gateway no bundle, define `VITE_MS_AUTH_BROWSER` com o URL do Gateway (aceitando o risco de CORS no browser até haver proxy ou CORS no emulador).

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

Em modo standalone, após login válido mostra-se confirmação de sessão e **Sair**; o `LoginPage` continua a usar o `authClient` (`VITE_MS_AUTH_URL` no build).

## Testes

Stack: **Vitest** + **@testing-library/react** + **jsdom**.

```bash
npm run test           # watch
npm run test:run       # one-shot
npm run test:coverage  # com cobertura HTML em coverage/
```

Os testes vivem em `src/**/__testes__/*.test.tsx` e mockam o `authClient`
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
│   │   └── __testes__/LoginPage.test.tsx
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

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](../plus-infra/README.md).

## Documentação relacionada

- [Manual de UI](./docs/UI_MANUAL.md) — fluxo de login, componentes MUI e
  estados visuais
