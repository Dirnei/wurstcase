# Tasks

## 1. Dockerfile

- [x] 1.1 Check that `npm test` runs vitest once (`vitest run`) so `CI=true` changes nothing but the
  limits. Verify in `package.json`.
- [x] 1.2 In the Dockerfile build stage, add `ARG CI=true` and `ENV CI=$CI` before `RUN npm test`,
  with a one-line comment on why (CI timing limits). Verify that `docker build .` passes
  and that its log shows the test summary.
- [x] 1.3 Verify the final image has no `CI`: `docker image inspect` on the built web image shows
  no `CI=` in `Config.Env`.
- [x] 1.4 Verify local runs stay strict: `npm test` without `CI` still uses the 4 s limit (read the
  guard, or run it with `CI` unset and check that the test name and limit are unchanged).

## 2. Team rule

- [x] 2.1 In `TEAM-SETUP.md` section 5, add the rule: before reporting READY, the worker runs
  `docker build .` (never `docker compose build web` from a worktree) and gives its exit code in
  the report. At merge, the exit code of
  `docker compose up -d --build web` goes into the merge report. Add "docker build" to the report
  format line. Verify by reading the section.

## 3. Verification

- [x] 3.1 Run `npm test`, `npm run check`, `npm run build` and `openspec validate
  docker-build-ci-allowance --strict`, and verify all pass.
- [x] 3.2 Rebuild and start the container (`docker compose up -d --build web`), check that it is
  healthy, and that http://localhost:8234 loads the game in the browser.
