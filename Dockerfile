# ---------- Stage 1: build ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Copy manifests first, install deps (enables layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source, then build
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install ONLY production dependencies for the final image
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the compiled server from the builder stage
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["node", "build"]

