# plus-shell

Shell App do projeto **Plus** — uma única página em que **login** e **dashboard** alternam com `useState` (sem React Router), para não depender de URLs `/login`, hash, nem do servidor servir paths do SPA.

A rota de login usa **`fetch` no próprio bundle** contra o `plus-ms-auth` (`VITE_MS_AUTH_URL`, por omissão `http://localhost:3001`).

---

## Tecnologias

- React 18 (sem React Router na v1 do shell — login e dashboard alternam com estado local)
- Vite 5
- `@vitejs/plugin-react`

---

## Variáveis de ambiente (build)

| Variável | Descrição |
|---|---|
| `VITE_MS_AUTH_URL` | Base URL do `plus-ms-auth` para `POST /auth/login` (ex.: `http://localhost:3001`) |

No Docker, `plus-infra` passa `VITE_MS_AUTH_BROWSER` como build-arg (ver `docker-compose.yml`).

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento na porta 3000 |
| `npm run build` | Gera o bundle em `dist/` |
| `npm run preview` | Serve o build na porta 3000 |

---

## Desenvolvimento local (sem Docker)

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

Garante que o `plus-ms-auth` está acessível na URL do build (`VITE_MS_AUTH_URL`, por omissão `http://localhost:3001`). Porque o shell **não** usa o API Gateway no browser em local, vê a nota ao **item 20** no `CHECKLIST.md` e a secção **Gateway vs MS** no README do `plus-mfe-auth`.

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o README do `plus-infra`.
