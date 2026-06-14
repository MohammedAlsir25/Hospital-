# MULTI-STAGE DOCKERFILE FOR AL JAWARIH HIS/ERP BLUEPRINT
# High-Performance containerization following cloud-native best practices.

# --- STAGE 1: Build & Bundling ---
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install absolute essential development and production packages
RUN npm ci

# Copy full application codebases
COPY . .

# Run production compilation which generates:
# 1. '/dist' (Vite static production build for frontend SPAs)
# 2. '/dist/server.cjs' (esbuild optimized multi-service backend server bundle)
RUN npm run build

# --- STAGE 2: Extreme Density Production Runner ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Hardcode ingress routing target port according to workspace requirements
ENV PORT=3000

# Copy necessary runtime artifacts only
COPY package*.json ./

# Install ONLY production dependencies to guarantee target size limits are minimized
RUN npm ci --only=production

# Pull optimized bundle assets from Builder layer
COPY --from=builder /app/dist ./dist

# Expose service runtime port
EXPOSE 3000

# Direct command launch using node interpreter over compiled CommonJS backend
CMD ["node", "dist/server.cjs"]
