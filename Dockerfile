# ---------- Stage 1: build ----------
# Pinned to the BUILD machine's architecture, not the target's. The output in
# build/ is plain JavaScript and runs anywhere, so there's no reason to compile
# it once per target arch — and emulating `npm ci` under QEMU crashes.
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

# Copy manifests first, install deps (enables layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source, then build
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
# Built per target arch, but runs no commands — only file copies — so nothing
# is emulated here either.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Links the published package to this repo on GitHub
LABEL org.opencontainers.image.source=https://github.com/trixilian/scout-lantern

# No `npm ci` here: package.json declares zero production dependencies, because
# adapter-node bundles everything it needs into build/. package.json is still
# copied so Node reads "type": "module" rather than inferring it.
COPY package.json ./

# Copy the compiled server from the builder stage
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["node", "build"]
