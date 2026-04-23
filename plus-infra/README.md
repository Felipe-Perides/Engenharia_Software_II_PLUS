# plus-infra

Repositório de infraestrutura local do projeto **Plus** — sistema de gestão de estoque de roupas.

Orquestra os microsserviços, microfrontends e a stack AWS local (Ministack) via Docker Compose. O provisionamento dos recursos AWS é feito automaticamente via Terraform ao subir a stack.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Docker | 24+ | https://docs.docker.com/get-docker/ |

---

## Estrutura de repositórios

Todos os repositórios devem estar dentro do mesmo diretório:

```
projeto/
├── plus-infra/          ← este repositório
│   ├── terraform/
│   │   ├── main.tf
│   │   └── variables.tf
│   ├── docker-compose.yml
│   ├── Makefile
│   └── .env.example
├── plus-ms-auth/        ← microsserviço
├── plus-mfe-auth/       ← microfrontend
└── plus-shell/          ← shell do frontend
```

### Clonando os repositórios irmãos

```bash
# A partir do diretório do projeto/
git clone <url-plus-ms-auth>  plus-ms-auth
git clone <url-plus-mfe-auth> plus-mfe-auth
git clone <url-plus-shell>    plus-shell
git clone <url-plus-infra>    plus-infra
```

---

## Configuração inicial

```bash
cd plus-infra

# 1. Copie e edite as variáveis de ambiente
cp .env.example .env
# Edite .env conforme necessário (JWT_SECRET em especial)

# 2. Sobe toda a stack
make setup
```

O `make setup`:
1. Inicializa os providers Terraform (`terraform init`)
2. Sobe o Ministack e aguarda ele estar saudável
3. Provisiona os recursos AWS via `terraform apply` (S3, RDS, API Gateway)
4. Sobe todos os demais serviços

> O provisionamento também acontece automaticamente ao rodar `docker compose up` diretamente — o serviço `infra-provisioner` executa o Terraform antes de liberar os demais serviços.

---

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `make setup` | Setup completo: `terraform init` → Ministack → `terraform apply` → todos os serviços |
| `make up` | Sobe todos os serviços (`docker compose up -d`) |
| `make down` | Para e remove os containers |
| `make logs` | Acompanha os logs em tempo real |
| `make reset` | Derruba tudo (inclusive volumes) e refaz o setup do zero |
| `make tf-init` | Inicializa os providers Terraform |
| `make tf-apply` | Provisiona os recursos no Ministack via Terraform |

---

## URLs e portas locais

| Serviço | URL local | Descrição |
|---|---|---|
| plus-shell | http://localhost:3000 | Shell App (microfrontend host) |
| plus-ms-auth | http://localhost:3001 | Microsserviço de autenticação |
| plus-mfe-auth | http://localhost:4001 | Microfrontend de autenticação |
| Ministack | http://localhost:4566 | Emulador AWS |
| API Gateway | `http://localhost:4566/restapis/<api-id>/v1/_user_request_` | Gateway para plus-ms-auth |
| RDS (PostgreSQL) | `localhost:5432` | Banco provisionado pelo Ministack |

> O ID do API Gateway é gerado dinamicamente pelo Terraform e exibido no output do `make setup`.
> Para consultar depois: `awslocal apigateway get-rest-apis`

### Rotas do API Gateway

| Método | Rota | Destino |
|---|---|---|
| POST | `/auth/login` | plus-ms-auth:3001 |
| POST | `/auth/refresh` | plus-ms-auth:3001 |
| POST | `/auth/logout` | plus-ms-auth:3001 |
| GET | `/auth/me` | plus-ms-auth:3001 |

---

## Como adicionar um novo microsserviço

1. **Crie o repositório** no mesmo nível dos demais (ex: `plus-ms-inventory/`).

2. **Adicione o serviço ao `docker-compose.yml`**, dependendo do `infra-provisioner`:

```yaml
plus-ms-inventory:
  build:
    context: ../plus-ms-inventory
    dockerfile: Dockerfile
  container_name: plus-ms-inventory
  ports:
    - "${MS_INVENTORY_PORT:-3002}:3002"
  environment:
    - AWS_ENDPOINT=http://ministack:4566
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
  depends_on:
    infra-provisioner:
      condition: service_completed_successfully
  restart: unless-stopped
```

3. **Adicione a porta ao `.env.example`** (e ao seu `.env`):

```env
MS_INVENTORY_PORT=3002
```

4. **Se precisar de rotas no API Gateway ou outros recursos AWS**, adicione os recursos correspondentes em `terraform/main.tf` seguindo os padrões já existentes para S3, RDS e API Gateway.

5. Rode `make reset` para recriar a stack com as novas configurações.
