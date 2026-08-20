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
docker run --rm -p 8080:3000 scout-lantern
```

Then open <http://localhost:8080>.

## Card data

Card data lives in `src/lib/data/cards.json`. This file is **gitignored** — it's kept
locally for builds only and is **not** committed to this repo. (The dataset will
eventually be served by a separate backend service.) Without it, `npm run build` /
`docker build` will fail, so make sure a `src/lib/data/cards.json` exists locally.
