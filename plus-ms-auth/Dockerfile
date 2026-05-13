# Stage 1: build — compila TypeScript para JavaScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: produção — imagem enxuta, só com o JS compilado
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
# Schema + seed idempotentes antes do API (evita BD vazia na primeira subida com Docker)
CMD ["sh", "-c", "node dist/scripts/init-db.js && node dist/server.js"]