# === Stage 1: Build ===
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Build arg para a URL do API Gateway — injetada no bundle pelo Vite
ARG VITE_MS_AUTH_URL
ENV VITE_MS_AUTH_URL=${VITE_MS_AUTH_URL}

# Instala dependências aproveitando cache do Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copia o resto e builda
COPY . .
RUN npm run build

# === Stage 2: Serve estático com Nginx ===
FROM nginx:1.27-alpine

# Configuração customizada (CORS + cache para Module Federation)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estático buildado
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4001

CMD ["nginx", "-g", "daemon off;"]
