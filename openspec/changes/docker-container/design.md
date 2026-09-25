# Design

## Context

See proposal.md (Why). The game builds to static files in `dist/` (`npm run build`), with relative
asset URLs (`base: './'`) and fingerprinted files under `dist/assets/`. Verification uses
`npm test` and `npm run check`. Docker 29.5 with Compose v5 is installed locally, with a Linux
engine. The production host for leberkas.org is not chosen yet; it is assumed to put a TLS
terminating reverse proxy in front of the container.

## Goals / Non-Goals

**Goals:**
- The image is the single artifact that both the local check and production run.
- A small final image (target: under 100 MB) that holds no Node, sources or dependencies.
- Repeatable builds: pinned base images and `npm ci` from the lockfile.

**Non-Goals:**
- TLS, domains, registries and CI (see proposal Non-goals).
- Changes to `src/`. No `src/game/` files and no content entries are added or changed.

## Decisions

### Files

```
Dockerfile        multi-stage: build (Node) → runtime (nginx, unprivileged)
nginx.conf        server block: caching, gzip, headers, 404s
compose.yaml      service "web": build ., ports 8080:8080
.dockerignore     node_modules, dist, .git, .vscode, .vitest, openspec, docs, *.log
README.md         dev and Docker run instructions
```

### Build stage: `node:24-alpine`, test before build

Node 24 matches the local toolchain. The stage copies `package.json` and `package-lock.json`
first and runs `npm ci`, so the dependency layer is cached until the lockfile changes. It then
copies the sources and runs `npm test && npm run check && npm run build`. Chaining them in one
`RUN` makes any failure abort the image build, which implements "broken code does not produce an
image". Alpine keeps the build stage small. The build stage never ships, so its size only
affects build time.

### Runtime stage: `nginxinc/nginx-unprivileged` (alpine), not `nginx`

The unprivileged variant runs as uid 101, listens on 8080 by default and needs no extra setup to
drop root. That gives the non-root and port requirements for free. Alternatives:
- Official `nginx` + a user switch: needs PID-file, cache-dir and port changes by hand.
- `caddy`: good, but nginx config for static caching is more widely documented and easier for a
  first project to look up.
- A Node static server (e.g. `serve`): would ship Node in the final image (larger, more attack
  surface) for no benefit.

Base images are pinned to a specific minor version tag during implementation (the current stable
tags are looked up at that time) rather than `latest`, so builds don't change silently.

### nginx configuration

- `location = /index.html` and `/` → `Cache-Control: no-cache`, so every load revalidates via
  ETag and players get new releases immediately.
- `location /assets/` → `Cache-Control: public, max-age=31536000, immutable`. Safe because Vite
  puts a content hash in these file names.
- `try_files $uri =404`. There is no SPA fallback (the game is a single page), so missing assets
  show up as real 404s instead of silently returning HTML.
- `gzip on` for `text/html`, `text/css`, `application/javascript`, `application/json`,
  `image/svg+xml`. Pre-compressed files and brotli are skipped: small payloads, extra build step.
- `server_tokens off`; `add_header X-Content-Type-Options nosniff always` and
  `add_header Referrer-Policy strict-origin-when-cross-origin always`. Because nginx drops
  inherited `add_header` directives in a location that defines its own, the security headers are
  kept in an included snippet and included in every location that also sets `Cache-Control`.

### Health check

Docker `HEALTHCHECK` runs `wget -q --spider http://127.0.0.1:8080/` (wget is present in alpine
images, curl is not) every 30 s, with a 5 s start period. A dedicated `/healthz` endpoint was
rejected: serving the real page proves more than a stub.

### Compose

One service `web`, `build: .`, `ports: "8080:8080"`, `restart: unless-stopped`. No volumes: the
container is immutable and the game saves live in the player's browser.

## Risks / Trade-offs

- [Running tests inside the image build makes builds slower] → Acceptable (seconds today). The
  dependency layer is cached, and it guarantees nothing untested ships.
- [Port 8080 is already used on a developer's machine] → The host port is a single line in
  `compose.yaml`; the README shows how to change it.
- [Production proxy expectations unknown] → The container serves plain HTTP on 8080, which fits
  every common proxy (Traefik, Caddy, nginx). Deployment details are settled in `release-v1`.
- [Security headers lost in a location block due to nginx inheritance rules] → The shared
  include snippet, plus explicit header checks in verification against `/` and `/assets/`.
