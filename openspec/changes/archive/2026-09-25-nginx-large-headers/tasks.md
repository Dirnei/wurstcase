# Tasks

## 1. Reproduce

- [x] 1.1 Rebuild and start the current image, then request `/` with a 16 KB `Cookie` header via curl; verify it returns 400 (the reported bug)

## 2. Fix

- [x] 2.1 Add `large_client_header_buffers 4 32k;` to the server block in `docker/nginx.conf` with a short comment on why; verify `docker compose up --build -d` succeeds and the container becomes healthy

## 3. Verification

- [x] 3.1 Via curl: `/` with a 16 KB `Cookie` header returns 200; with a 40 KB `Cookie` header returns 400; without cookies returns 200 with the unchanged caching and security headers
- [x] 3.2 Run `npm test` and `npm run check`, then play-check `http://localhost:8234` in the browser that reported the 400: the game loads, the counter runs and DE/EN switches; finally `docker compose down`
