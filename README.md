# Wurst Case

A browser idle game with a vegan theme. Build a plant-based food empire, rescue
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

### Impressum and privacy details

The legal pages show the operator's details from environment variables. Without them the game
shows placeholders (Max Mustermann, …) and the container logs a warning at start-up. Put your real
details in a `.env` file next to `compose.yaml` (it is git-ignored, so they never get committed):

```bash
LEGAL_NAME=Erika Beispiel
LEGAL_STREET=Beispielweg 3
LEGAL_POSTAL_CODE=80331
LEGAL_CITY=München
LEGAL_COUNTRY=Deutschland
LEGAL_EMAIL=kontakt@example.org
LEGAL_HOSTING_PROVIDER=Beispiel Hosting GmbH, Beispielstraße 5, 10115 Berlin
```

Then apply them with `docker compose up -d` (no rebuild needed).
