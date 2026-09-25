# Proposal

## Why

The game is meant to be hosted at leberkas.org, and there should be one easy way to run exactly
what players will get, both locally and later in production. A Docker image that builds and
serves the static game provides that. This is row 2, `docker-container`, of the change sequence
in section 8 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` (added after
`project-scaffold`).

## What Changes

- A multi-stage `Dockerfile`: a Node stage installs dependencies, runs the tests and type check,
  and builds the game; a small static web server stage serves only the built files.
- A web server configuration for the game: caching that makes new releases reach players on their
  next page load, compression, basic security headers, and 404 for missing files.
- A `compose.yaml` so `docker compose up --build` runs the production build locally at
  `http://localhost:8080`.
- A `.dockerignore` so the build context stays small and never includes local `node_modules`,
  `dist` or Git data.
- A short `README.md` explaining how to run the game in development (`npm run dev`) and with
  Docker.

## Capabilities

### New Capabilities

- `container-deployment`: how the game is packaged and served as a container image: what it
  serves, how it caches, what makes the build fail, and how the container reports its health.

### Modified Capabilities

None. The game's behavior (`game-loop`, `localization`, `number-formatting`) is unchanged.

## Non-goals

- A development container with hot reload. The user chose production-only; day-to-day work stays
  on `npm run dev`.
- Actually deploying to leberkas.org: TLS, domain, reverse proxy and server setup belong to
  `release-v1` (13).
- Pushing the image to a registry, and CI/CD pipelines: later, once a production host exists.
- A Content-Security-Policy header: deferred until the game has its full set of assets and
  embeds, so it doesn't need rewriting later.
- The itch.io upload, which uses the plain `dist/` zip rather than the image: `release-v1`.

## Impact

- New files: `Dockerfile`, `nginx.conf` (or equivalent server config), `compose.yaml`,
  `.dockerignore`, `README.md`.
- No changes to `src/`, the game logic or the existing npm scripts.
- New local requirement for this workflow only: Docker with Compose v2 (already installed).
