# Proposal

## Why

Opening the Docker-served game at `http://localhost:8234` in Chrome returned
`400 Request Header Or Cookie Too Large`. Browsers scope cookies by host name, not port, so every
app a developer runs on `localhost` (e.g. Keycloak) adds its cookies to requests for the game.
nginx's default limit of 8 KB per request header line rejects the combined `Cookie` header before
serving anything. The game uses no cookies itself, but it must still load in such browsers. This
is a follow-up fix to row 2, `docker-container`, in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`.

## What Changes

- The container's web server accepts request header lines up to 32 KB (previously 8 KB), so
  requests carrying large foreign cookies are served normally.
- Requests whose header lines exceed 32 KB are still rejected with 400.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `container-deployment`: adds a requirement on the request header sizes the server accepts.

## Non-goals

- Stripping or ignoring cookies. The game neither reads nor sets cookies; nginx only has to accept
  them.
- Any change to the game code or other server behavior (caching, headers, 404s).
- Production hardening of request limits beyond this: `release-v1` (13).

## Impact

- `docker/nginx.conf`: one directive, `large_client_header_buffers 4 32k;`.
- The image must be rebuilt (`docker compose up --build`).
