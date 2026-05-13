# plus-ms-auth

Microsserviço de autenticação do projeto **Plus**.

Expõe uma API REST com JWT para login, refresh, logout e consulta do usuário autenticado. Persiste usuários em PostgreSQL (provisionado pelo Ministack via `plus-infra`). Implementa RBAC com as roles `ADMIN`, `STAFF` e `MANAGER`.

---

## Tecnologias

- Node.js 20 + TypeScript 5
- Express 4
- JWT (`jsonwebtoken`) — access token (15 min) + refresh token (7 dias)
- bcryptjs — hash de senhas
- PostgreSQL (`pg`)
- Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)
- Vitest — testes unitários

---

## Estrutura do projeto
src/
├── db/
│   └── pool.ts           # Conexão com PostgreSQL via Pool
├── middlewares/
│   ├── auth.ts           # Middleware de verificação JWT
│   └── requireRole.ts    # Middleware de autorização RBAC
├── routes/
│   └── auth.ts           # Endpoints /auth/* com anotações OpenAPI
├── scripts/
│   └── init-db.ts        # Schema + utilizadores de exemplo (Docker e npm run init-db)
├── swagger/
│   └── config.ts         # Configuração do swagger-jsdoc
├── app.ts                # Montagem do Express (CORS, rotas, Swagger)
└── server.ts             # Entry point — abre a porta
tests/
└── auth.test.ts          # Testes unitários com Vitest
---

## Endpoints

| Método | Rota           | Autenticação | Descrição                                              |
|--------|----------------|--------------|--------------------------------------------------------|
| POST   | `/auth/login`  | Não          | Autentica com email e senha; retorna `token` e `refresh` |
| POST   | `/auth/refresh`| Não          | Valida o refresh token, lê o utilizador na BD e devolve novo access token (com `email` e `role`) |
| POST   | `/auth/logout` | Bearer JWT   | Encerra a sessão (stateless)                          |
| GET    | `/auth/me`     | Bearer JWT   | Retorna os dados do utilizador autenticado               |
| GET    | `/auth/admin/ping` | Bearer JWT | Exemplo RBAC: apenas role `ADMIN` (403 caso contrário) |

Documentação interativa disponível em `http://localhost:3001/docs` após subir o serviço.

---

## RBAC — Roles disponíveis

| Role      | Descrição                        |
|-----------|----------------------------------|
| `ADMIN`   | Acesso total ao sistema          |
| `MANAGER` | Gerenciamento de estoque e equipe|
| `STAFF`   | Operações básicas de estoque     |

A `role` vai no access JWT após login e após refresh (o refresh consulta `users` e emite um novo access token com `sub`, `email` e `role`). O middleware `requireRole` restringe rotas; exemplo: `GET /auth/admin/ping` exige `ADMIN`.

---

## Base de dados (init automático)

Na **primeira subida com Docker** (`plus-infra`), o contentor do MS corre **`dist/scripts/init-db.js` antes do servidor**: cria a tabela `users` (se não existir) e insere três utilizadores de **demonstração** (só se o email ainda não existir):

| Email               | Senha       | Role    |
|---------------------|------------|---------|
| `admin@example.com` | `Admin123!` | `ADMIN` |
| `staff@example.com` | `Staff123!` | `STAFF` |
| `manager@example.com` | `Manager123!` | `MANAGER` |

**Desenvolvimento local** (Postgres já a correr): antes do primeiro `npm run dev`, executa uma vez:

```bash
npm run init-db
```

> **Pré-requisito:** o PostgreSQL tem de estar acessível em `DB_HOST`:`DB_PORT` (por defeito `localhost:5432`). Com o **Ministack** do `plus-infra` no ar (`make setup` ou `docker compose up`), o RDS emulado costuma expor a porta **5432** no host. Se `npm run init-db` falhar com `ECONNREFUSED`, a BD ainda não está a escutar — sobe a stack em `plus-infra` primeiro ou instala Postgres localmente com as credenciais do `.env`.

> Estas credenciais são só para ambiente local; não uses em produção.

---

## Variáveis de ambiente

Copie `.env.example` e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável       | Padrão        | Descrição                        |
|----------------|---------------|----------------------------------|
| `PORT`         | `3001`        | Porta do servidor                |
| `LISTEN_HOST`  | `0.0.0.0`     | Interface onde o servidor escuta (`0.0.0.0` = IPv4 em todas as interfaces; em Docker no Windows evita `ERR_EMPTY_RESPONSE` em `localhost` se o Node escutasse só em IPv6) |
| `JWT_SECRET`   | `change-me`   | Segredo para assinar os tokens   |
| `DB_HOST`      | `localhost`   | Host do PostgreSQL               |
| `DB_PORT`      | `5432`        | Porta do PostgreSQL              |
| `DB_USER`      | `plus`        | Usuário do banco                 |
| `DB_PASSWORD`  | `plus_secret` | Senha do banco                   |
| `DB_NAME`      | `plus_auth`   | Nome do banco                    |
| `AWS_ENDPOINT` | `http://localhost:4566` | Endpoint do Ministack  |

---

## Desenvolvimento local (sem Docker)

```bash
npm install
npm run init-db   # primeira vez (ou após apagar a BD)
npm run dev
```

> Para rodar isolado, o PostgreSQL tem de estar a escutar em `DB_HOST`/`DB_PORT` (ver secção **Base de dados** acima).

A raiz **`http://localhost:3001/`** redireciona para **`/docs`** (Swagger). Documentação: **`http://localhost:3001/docs`**

---

## Testar login no Windows (evitar erro de JSON)

O erro `SyntaxError: Expected property name or '}' in JSON at position 1` no servidor quase sempre significa que o **corpo do POST não é JSON válido** (por exemplo PowerShell alterou aspas, ou usou `curl` em vez de `curl.exe`).

**Opção recomendada — ficheiro JSON (na pasta `plus-ms-auth`):**

```powershell
cd C:\caminho\para\plus-ms-auth
curl.exe -s -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" --data-binary "@examples\login.json"
```

**Opção PowerShell nativa:**

```powershell
$body = '{"email":"admin@example.com","password":"Admin123!"}'
Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $body -ContentType "application/json; charset=utf-8"
```

**Depois de alterar o codigo do MS:** na pasta `plus-infra`, rebuilde o contentor para o Docker usar a imagem nova:

```powershell
docker compose build plus-ms-auth --no-cache
docker compose up -d
```

---

## API Gateway (curl)

Use **`curl.exe`** e ponha o URL do Terraform **entre aspas**. O path do login e sempre **`/auth/login`** a seguir ao `_user_request_` (sem barra extra no meio errada):

```powershell
$gw = terraform -chdir=terraform output -raw gateway_url   # na pasta plus-infra
curl.exe -s -w "`nHTTP_CODE:%{http_code}`n" -X POST "$gw/auth/login" -H "Content-Type: application/json" --data-binary "@..\plus-ms-auth\examples\login.json"
```

Se `HTTP_CODE:000` ou resposta vazia, o Gateway ou o Ministack não estão a responder — confirme `docker compose ps` e que o URL não tem espaços.

---

## Scripts disponíveis

| Comando              | Descrição                              |
|----------------------|----------------------------------------|
| `npm run init-db`    | Cria tabela `users` + utilizadores de demo (idempotente) |
| `npm run dev`        | Inicia em modo desenvolvimento (ts-node-dev) |
| `npm run build`      | Compila TypeScript para `dist/`        |
| `npm start`          | Corre `init-db` compilado e depois o servidor (requer `npm run build`) |
| `npm test`           | Executa os testes unitários (Vitest)   |
| `npm run test:watch` | Testes em modo watch                   |
| `npm run test:coverage` | Relatório de cobertura de testes    |

---

## Testes

```bash
npm test
```

15 testes cobrindo login, refresh (incluindo `/me` após refresh), logout, `/me`, RBAC em `/auth/admin/ping`. O banco e o bcrypt são mockados — nenhuma conexão real é necessária para rodar os testes.

---

## Executando com a stack completa

Na imagem Docker, o MS corre **`init-db` automaticamente** antes de abrir a API (schema + utilizadores de demonstração).

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](../plus-infra/README.md).