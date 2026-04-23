FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Injeta a URL do MFE de auth em tempo de build
ARG MFE_AUTH_URL=http://localhost:4001/assets/remoteEntry.js
ENV MFE_AUTH_URL=$MFE_AUTH_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["vite", "preview", "--port", "3000", "--host"]
