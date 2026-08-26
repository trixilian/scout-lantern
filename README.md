# Scout Lantern

A card search & filter web UI. Built with **SvelteKit** (Svelte + TypeScript), served by
a Node server (`adapter-node`), and packaged as a **Docker** image.

## Develop

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Build & run with Docker

```bash
docker build -t scout-lantern .
docker run --rm -p 8080:3000 -e BACKEND_URL=http://host.docker.internal:8000 scout-lantern
```

Then open <http://localhost:8080>.

`host.docker.internal` reaches a backend running on your host machine — inside the container,
`localhost` means the container itself.

## Publishing the image

The frontend is published to GitHub Container Registry as
`ghcr.io/trixilian/scout-lantern`. Orchestration (Docker Compose) lives in a separate repo and
pulls this image rather than building from source.

```bash
docker build -t ghcr.io/trixilian/scout-lantern:latest .
echo "$CR_PAT" | docker login ghcr.io -u trixilian --password-stdin
docker push ghcr.io/trixilian/scout-lantern:latest
```

`CR_PAT` is a GitHub personal access token (classic) with the `write:packages` scope.

The package is **private on first push** — make it public in its package settings if it should
be pullable without authentication.

## Card data

Card data is served by a separate backend service over HTTP. This repo contains no card
data of its own.

Set `BACKEND_URL` to point at that service:

```bash
BACKEND_URL=http://localhost:8000
```

For local development, put it in a `.env` file (gitignored — see `.env.example`). In Docker,
pass it at run time with `-e BACKEND_URL=...`.
