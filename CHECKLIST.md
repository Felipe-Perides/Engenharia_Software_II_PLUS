# Checklist Cronológica do Projeto Plus

Este checklist foi preparado para acompanhar a entrega do trabalho de T1, focando na solução de autenticação/authorization, microfrontend e infraestrutura base.

## Etapa 1: Infraestrutura Base

1. Configurar `.env` em `plus-infra` com variáveis de ambiente:
   - `JWT_SECRET`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `VITE_MS_AUTH_URL` apontando para o API Gateway
   - demais variáveis do `plus-infra`
   - Diretório afetado: `plus-infra`

2. Corrigir o Terraform de `plus-infra/terraform/main.tf` para que o API Gateway aponte para os URIs corretos:
   - `http://plus-ms-auth:3001/auth/login`
   - `http://plus-ms-auth:3001/auth/refresh`
   - `http://plus-ms-auth:3001/auth/logout`
   - `http://plus-ms-auth:3001/auth/me`
   - Diretório afetado: `plus-infra`

3. Criar script de inicialização do banco no container para criar schema/tabelas necessárias (users + roles ou coluna role string):
   - Diretório afetado: `plus-infra`

4. Ajustar `docker-compose.yml` em `plus-infra` para incluir o MS e o MFE com suas dependências corretas:
   - Inserir a rede e volumes necessários
   - Garantir que o `plus-ms-auth` esteja acessível via nome de serviço `plus-ms-auth`
   - Diretório afetado: `plus-infra`

5. Validar o Makefile e comandos disponíveis em `plus-infra`:
   - `make setup`
   - `make up`
   - `make down`
   - `make reset`
   - Diretório afetado: `plus-infra`


## Etapa 2: Microsserviço de Autenticação (MS)

6. Inicializar `plus-ms-auth` com Node.js + TypeScript + Express.
   - Diretório afetado: `plus-ms-auth`

7. Instalar dependências no MS:
   - `express`, `cors`, `jsonwebtoken`, `bcryptjs`, `pg`, `dotenv`
   - Tipagens TypeScript para Express, Node, jsonwebtoken, bcryptjs
   - Diretório afetado: `plus-ms-auth`

8. Implementar conexão com PostgreSQL usando `pg` e `Pool`.
   - Diretório afetado: `plus-ms-auth`

9. Implementar CORS no MS para permitir origens locais do shell e do MFE:
   - `http://localhost:3000`
   - `http://localhost:4001`
   - Diretório afetado: `plus-ms-auth`

10. Implementar endpoints REST no MS:
    - `POST /auth/login`
    - `POST /auth/refresh`
    - `POST /auth/logout`
    - `GET /auth/me`
    - Diretório afetado: `plus-ms-auth`

11. Implementar RBAC no MS para as roles `ADMIN`, `STAFF`, `MANAGER`:
    - Incluir `role` no payload JWT
    - Criar middleware de autorização para validar role quando necessário
    - Diretório afetado: `plus-ms-auth`

12. Criar testes unitários com Vitest para o MS:
    - Fluxo de login
    - Refresh token
    - Logout
    - Proteção de `GET /auth/me`
    - Diretório afetado: `plus-ms-auth`

13. Gerar documentação Swagger/OpenAPI para o MS:
    - Descrever endpoints e schemas
    - Incluir exemplos de request/response
    - Diretório afetado: `plus-ms-auth`

14. Criar Dockerfile TypeScript para o MS:
    - Multi-stage build
    - Compilar TS para JS
    - Expor porta 3001
    - Diretório afetado: `plus-ms-auth`

15. Atualizar README do MS com instruções de uso local e via infra.
    - Diretório afetado: `plus-ms-auth`

16. Configurar pipeline GitHub Actions no repositório do MS:
    - Instalação
    - Execução de testes Vitest
    - Build da imagem Docker
    - (Opcional) Publicação de imagem Docker
    - Diretório afetado: `plus-ms-auth`


## Etapa 3: Microfrontend de Autenticação (MFE)

17. Migrar/ajustar `plus-mfe-auth` para TypeScript:
    - `LoginPage.tsx`
    - Tipagens para props e respostas do MS
    - Diretório afetado: `plus-mfe-auth`

18. Instalar dependências do MFE:
    - `react`, `react-dom`, `typescript`, `@types/react`, `@types/react-dom`
    - `@mui/material`, `@emotion/react`, `@emotion/styled`
    - `@originjs/vite-plugin-federation`
    - Diretório afetado: `plus-mfe-auth`

19. Implementar `LoginPage.tsx` com MUI:
    - Formulário de email e senha
    - Validação básica de campos
    - Tratamento de erro de login
    - Diretório afetado: `plus-mfe-auth`

20. Implementar comunicação com o MS via API Gateway usando `fetch`:
    - `VITE_MS_AUTH_URL` deve apontar para o Gateway `4566/.../_user_request_`
    - Usar endpoint `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
    - Diretório afetado: `plus-mfe-auth`

> **Nota (local / browser — item 20):** O código usa `import.meta.env.VITE_MS_AUTH_URL` no bundle. O `make setup` / `sync-vite-gateway` mantém `VITE_MS_AUTH_URL` no `.env` com o URL do API Gateway (Terraform), como referência e para testes com `curl` ou clientes sem CORS de browser. No **Docker**, o build do MFE (e do shell) usa por omissão **`VITE_MS_AUTH_BROWSER=http://localhost:3001`**, para o browser chamar **diretamente** o `plus-ms-auth`: o Gateway em LocalStack (`4566`) costuma **não** devolver CORS utilizável entre `localhost:3000` / `4001` e `4566`, o que quebra `fetch` no browser. Isto não invalida o Gateway na **arquitetura** (Terraform, integrações); só documenta que, em **local**, o caminho browser→Gateway fica **desativado** por pragmatismo até haver CORS no emulador ou um proxy na mesma origem.

21. Implementar gerenciamento de token no MFE:
    - Armazenar access token / refresh token de forma segura
    - Utilizar `localStorage` ou `sessionStorage`
    - Diretório afetado: `plus-mfe-auth`

22. Criar testes unitários com Vitest para o MFE:
    - LoginPage renderiza corretamente
    - Submissão do formulário
    - Exibição de erros
    - Diretório afetado: `plus-mfe-auth`

23. Criar manual de UI do MFE:
    - Descrever fluxo de login
    - Mostrar componentes MUI usados
    - Explicar como o usuário final interage com o sistema
    - Diretório afetado: `plus-mfe-auth`

24. Criar Dockerfile para o MFE:
    - Build do app com Vite
    - Servir estático (por exemplo, Nginx)
    - Diretório afetado: `plus-mfe-auth`

25. Atualizar README do MFE com instruções de desenvolvimento e integração.
    - Diretório afetado: `plus-mfe-auth`

26. Configurar pipeline GitHub Actions no repositório do MFE:
    - Instalação
    - Execução de testes Vitest
    - Build da aplicação
    - Build da imagem Docker
    - Diretório afetado: `plus-mfe-auth`


## Etapa 4: Shell App e Integração

27. Validar o host `plus-shell` e o consumo do remote `mfe_auth`:
    - Checar `vite.config.js`
    - Garantir que o `shell` usa o URL do `remoteEntry.js`
    - Diretório afetado: `plus-shell`

28. Ajustar `App.jsx` / rotas do `plus-shell` para renderizar o `LoginPage` remoto.
    - Diretório afetado: `plus-shell`

29. Atualizar README do shell com instruções para rodar o host e os remotes.
    - Diretório afetado: `plus-shell`

30. Configurar pipeline GitHub Actions no `plus-shell`:
    - Build da app host
    - Testes se aplicarem
    - Diretório afetado: `plus-shell`


## Etapa 5: ADR e Documentação Final

> **Entrega:** ADR na raiz do monorepo: [`ADR-0001-arquitetura-stack-plus.md`](./ADR-0001-arquitetura-stack-plus.md). OpenAPI/Swagger consolidado no README do `plus-ms-auth`. Manual de UI em [`plus-mfe-auth/docs/UI_MANUAL.md`](./plus-mfe-auth/docs/UI_MANUAL.md). READMEs de `plus-infra`, `plus-ms-auth`, `plus-mfe-auth` e `plus-shell` revistos para o fluxo actual (Federation, `MFE_AUTH_URL`, browser vs Gateway).

31. Criar documento ADR no diretório principal do repositório:
    - Registrar decisões arquiteturais
    - Justificar escolha de Node.js, TypeScript, MUI, JWT, Terraform, Gateway
    - Analisar trade-offs
    - Diretório afetado: raiz do repositório

32. Consolidar documentação Swagger e manual de UI nos respectivos repositórios:
    - `plus-ms-auth` Swagger/OpenAPI
    - `plus-mfe-auth` manual de UI
    - Diretórios afetados: `plus-ms-auth`, `plus-mfe-auth`

33. Revisar READMEs de todos os repositórios e atualizar com o fluxo correto.
    - Diretórios afetados: `plus-infra`, `plus-ms-auth`, `plus-mfe-auth`, `plus-shell`


## Etapa 6: Validação Final

> **Validação local (2026-05-13):** `docker compose ps` — ministack (healthy), plus-ms-auth, plus-mfe-auth (healthy), plus-shell em execução. HTTP 200 em `http://localhost:3000/`, `http://localhost:4001/assets/remoteEntry.js`, `http://localhost:3001/docs`. **35** — `POST /auth/login` e `GET /auth/me` (Bearer) no MS: HTTP 200 com `examples/login.json`. **36** — mesmo fluxo via `terraform output -raw gateway_url`: HTTP 200. **37** — integração shell+MFE verificada (serviços e assets); o bundle do MFE em Docker contém `BASE_URL "http://localhost:3001"` (override `VITE_MS_AUTH_BROWSER`), não o Gateway — alinhado à nota do item 20; login no browser usa o MS directo. **38** — workflows `.github/workflows/ci.yml` revistos; comandos equivalentes corridos localmente: `plus-ms-auth` `npm test` (15 testes), `plus-mfe-auth` `npm run type-check` + `npm run test:run` (10) + `npm run build`, `plus-shell` `npm run test:run` + `npm run build`. **39** — `docker compose build plus-ms-auth plus-mfe-auth plus-shell` concluído com sucesso. **40** — ADR presente; auth/RBAC/Swagger; MFE React+TS+MUI+Federation; documentação nos READMEs + `UI_MANUAL.md`. *GitHub Actions em `github.com` não foram disparados nesta sessão.*

34. Subir stack completa com `plus-infra` e validar funcionamento geral.
    - Diretório afetado: `plus-infra`

35. Testar fluxo de autenticação direto via MS:
    - `POST http://localhost:3001/auth/login`
    - `GET http://localhost:3001/auth/me`
    - Diretório afetado: `plus-ms-auth`

36. Testar fluxo de autenticação via API Gateway:
    - `POST http://localhost:4566/restapis/<api-id>/v1/_user_request_/auth/login`
    - `GET http://localhost:4566/restapis/<api-id>/v1/_user_request_/auth/me`
    - Diretório afetado: `plus-infra` / `plus-ms-auth`

37. Testar o login pelo MFE integrado ao `plus-shell` usando o Gateway.
    - Diretórios afetados: `plus-mfe-auth`, `plus-shell`

38. Validar os pipelines GitHub Actions de CI/CD:
    - MS
    - MFE
    - Shell
    - Diretórios afetados: `plus-ms-auth`, `plus-mfe-auth`, `plus-shell`

39. Confirmar geração de imagens Docker e releases locais conforme solicitado.
    - Diretórios afetados: `plus-ms-auth`, `plus-mfe-auth`

40. Validar se o projeto atende aos critérios de avaliação:
    - ADR
    - Autenticação/Autorização
    - MFE com React + TS + MUI
    - CI/CD com testes e build
    - Documentação
    - Diretórios afetados: todos
