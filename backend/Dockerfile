# ===== Etapa 1: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./
# Instalar TODAS las dependencias (incluye devDependencies para compilar)
RUN npm ci

# Copiar el código fuente y compilar TypeScript → dist/
COPY . .
RUN npm run build

# ===== Etapa 2: Producción (imagen final ligera) =====
FROM node:20-alpine
WORKDIR /app

# Solo copiar lo necesario para ejecutar
COPY --from=builder /app/dist ./dist
COPY package*.json ./
# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Exponer el puerto de NestJS
EXPOSE 3000

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api || exit 1

CMD ["node", "dist/main"]
