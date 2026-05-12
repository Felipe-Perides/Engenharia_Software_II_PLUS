FROM node:20-bookworm-slim AS build
WORKDIR /app
ARG VITE_MS_AUTH_URL
ENV VITE_MS_AUTH_URL=${VITE_MS_AUTH_URL}
COPY package.json package-lock.json* ./
RUN npm ci && npm install @rolldown/binding-linux-x64-gnu
COPY . .
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ARG VITE_MS_AUTH_URL
ENV VITE_MS_AUTH_URL=${VITE_MS_AUTH_URL}
RUN npm install -g vite
COPY --from=build /app/dist ./dist
EXPOSE 4001
CMD ["vite", "preview", "--port", "4001", "--host"]
