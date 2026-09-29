# Design

## Context

`src/game/balance/simulate.test.ts` picks the guard's limit with `process.env.CI ? 10_000 :
4_000`. The Dockerfile's build stage runs `npm test && npm run check && npm run build`
without `CI`. See proposal.md, Why, for the measured times.

No `src/game/` file or content entry is added or changed.

## Decisions

1. **`ARG CI=true` plus `ENV CI=$CI` in the build stage, placed before `RUN npm test`.** The ARG
   lets someone build with `--build-arg CI=` to reproduce the strict limit if they ever need to.
   ENV makes the value visible to the `RUN`. The alternative, `RUN CI=true npm test`, is shorter,
   but the head asked for the ARG form, and it's overridable. Either one meets the spec.
2. **Build stage only.** The runtime stage starts `FROM nginx…` fresh, so the variable doesn't
   leak into the final image. Verify with `docker image inspect`.
3. **Leave the test alone.** The limits are the head's call (test thresholds). The spec only fixes
   that the image counts as CI.
4. **The team rule lives in TEAM-SETUP.md**, not in a spec. It's a process rule, not game
   behaviour.

## Risks / Trade-offs

- [`CI=true` changes other tools' behaviour (for example, npm or vitest output without colours or
  watch mode)] → vitest runs once anyway (`npm test` is `vitest run`, or check it). Check that the
  build log still shows the test summary.
- [A real 2× slowdown would pass in Docker] → the local run and GitHub CI still catch it, and 10 s
  still stops a pathological slowdown.

## Migration Plan

None. The next `docker compose up -d --build web` uses it.

## Implementation Notes (ui-worker, 2026-09-29)

- `npm test` is `vitest run` (package.json), so `CI=true` changes nothing but the guard's limit;
  the image build log still shows the summary (43 files, 712 tests passed).
- `docker compose build web` in the worktree: exit 0. Final image `Config.Env` has no `CI`
  (PATH and the nginx variables only). The build stage (`docker build --target build`) has
  `CI=true`; the speed guard took 2,521 ms there, against its 10 s CI limit.
- Local `npm test` with `CI` unset: 712 passed, the guard's limit stays `4_000` (test unchanged).
- Side effect to know: `docker compose build web` from a worktree retags `vegle:local`, the tag
  the running container of main uses. I pointed the tag back at main's image right after. The
  TEAM-SETUP rule therefore also allows `docker build .`, which leaves the tag alone.
- Task 3.2 (rebuild and start the container) runs at merge, with the exit code and image ID in
  the merge report.

