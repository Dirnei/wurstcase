# Tasks

## 1. Image

- [ ] 1.1 Look up the current stable `node:24-alpine` and `nginxinc/nginx-unprivileged` alpine tags and record the pinned tags in the Dockerfile; verify both pull successfully
- [ ] 1.2 Add `.dockerignore` (node_modules, dist, .git, .vscode, .vitest, openspec, docs, logs); verify the build context sent to Docker is under 1 MB
- [ ] 1.3 Write the build stage (`npm ci`, then `npm test && npm run check && npm run build`); verify `docker build --target build .` succeeds
- [ ] 1.4 Write `nginx.conf` with the security-header snippet, caching, gzip, `try_files $uri =404` and `server_tokens off`, and the runtime stage copying `dist/` and the config, with `HEALTHCHECK`; verify `docker build .` succeeds and the final image is under 100 MB

## 2. Compose and docs

- [ ] 2.1 Add `compose.yaml` (service `web`, port 8080:8080, `restart: unless-stopped`); verify `docker compose up --build -d` starts and `docker compose ps` shows the service running
- [ ] 2.2 Write `README.md` with a short description, `npm run dev` / `npm test` usage, and `docker compose up --build` usage including how to change the host port; verify the commands in it work as written

## 3. Verification

- [ ] 3.1 Check HTTP behavior against the running container with curl: `/` is 200 with `Cache-Control: no-cache`; every referenced asset is 200 and `/assets/*` carries the one-year immutable header; `/src/main.ts`, `/package.json` and `/does-not-exist.js` are 404; gzip is applied with `Accept-Encoding: gzip`; `X-Content-Type-Options` and `Referrer-Policy` are present on `/` and on `/assets/*`; `Server` shows no version
- [ ] 3.2 Check container properties: health status is `healthy` within 30 s; server processes run as a non-root user; the final image contains no `node` binary or `src/` directory
- [ ] 3.3 Break a test on purpose, verify `docker compose build` fails, then revert and verify it succeeds again
- [ ] 3.4 Run `npm test`, `npm run check` and `npm run build` locally, then play-check `http://localhost:8080` in the browser: the counter runs, the DE/EN toggle works, and a reload keeps the language; finally `docker compose down`
