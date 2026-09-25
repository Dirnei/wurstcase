# Leverkas

A browser idle game with a vegan theme (working title). Build a plant-based food empire, rescue
animals from MegaMeat Corp and give them a home on your Lebenshof. The concept lives in
[`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`](docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md);
detailed specs are managed with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in `openspec/`.

## Development

Requires Node 24.

```bash
npm install
npm run dev      # dev server with hot reload
npm test         # unit tests (Vitest)
npm run check    # type check (svelte-check + tsc)
npm run build    # production build into dist/
```

## Run the production build with Docker

Requires Docker with Compose.

```bash
docker compose up --build -d   # build the image and start it
docker compose down            # stop it
```

The game is then served at <http://localhost:8234>. The image build runs the tests and the type
check first, so it fails if either fails.

If port 8234 is already in use, choose another host port with `VEGLE_PORT`:

```bash
VEGLE_PORT=8480 docker compose up --build -d            # bash
$env:VEGLE_PORT=8480; docker compose up --build -d      # PowerShell
```
