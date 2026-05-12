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
| POST   | `/auth/refresh`| Não          | Troca um refresh token válido por um novo access token |
| POST   | `/auth/logout` | Bearer JWT   | Encerra a sessão (stateless)                          |
| GET    | `/auth/me`     | Bearer JWT   | Retorna os dados do usuário autenticado               |

Documentação interativa disponível em `http://localhost:3001/docs` após subir o serviço.

---

## RBAC — Roles disponíveis

| Role      | Descrição                        |
|-----------|----------------------------------|
| `ADMIN`   | Acesso total ao sistema          |
| `MANAGER` | Gerenciamento de estoque e equipe|
| `STAFF`   | Operações básicas de estoque     |

A `role` é incluída no payload do JWT e validada pelo middleware `requireRole` em rotas protegidas.

---

## Variáveis de ambiente

Copie `.env.example` e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável       | Padrão        | Descrição                        |
|----------------|---------------|----------------------------------|
| `PORT`         | `3001`        | Porta do servidor                |
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
npm run dev
```

> Para rodar isolado, é necessário ter o PostgreSQL disponível na porta configurada em `.env`.

Acesse: `http://localhost:3001`
Documentação Swagger: `http://localhost:3001/docs`

---

## Scripts disponíveis

| Comando              | Descrição                              |
|----------------------|----------------------------------------|
| `npm run dev`        | Inicia em modo desenvolvimento (ts-node-dev) |
| `npm run build`      | Compila TypeScript para `dist/`        |
| `npm start`          | Roda o build compilado                 |
| `npm test`           | Executa os testes unitários (Vitest)   |
| `npm run test:watch` | Testes em modo watch                   |
| `npm run test:coverage` | Relatório de cobertura de testes    |

---

## Testes

```bash
npm test
```

11 testes cobrindo os fluxos de login, refresh, logout e proteção de rotas. O banco e o bcrypt são mockados — nenhuma conexão real é necessária para rodar os testes.

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](../plus-infra/README.md).