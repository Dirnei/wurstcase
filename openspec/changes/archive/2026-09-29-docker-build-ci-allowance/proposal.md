# Proposal

## Why

The Dockerfile's build stage runs `npm test` without `CI` set, so the "60-minute game in under
4 s" speed guard uses its strict local limit inside the image. The validator measured 2.9 s in
Docker under normal local load (2.4 s on a quiet machine). That is too close to 4 s, and the same
pattern already broke the image build at 44540aa. The user wants the Docker build to always pass
on working code. A second, related gap is that no rule makes a worker prove the image builds
before it reports READY.

This is tooling around the container deployment (concept doc section 8, row 13 `release-v1`,
container deployment). It does not match a planned row of its own.

## What Changes

- The Dockerfile build stage sets `CI=true` (`ARG CI=true` and `ENV CI=$CI`), so the tests in the
  image use the CI limits (10 s for the speed guard). Only the build stage gets it; the nginx
  runtime stage doesn't.
- A local `npm test` keeps the strict 4 s limit. The guard itself and its limits stay unchanged.
- TEAM-SETUP.md section 5 gets a standing rule: a worker runs `docker compose build web` (or
  `docker build .`) before reporting READY and gives the exit code in the report. At merge, the
  rebuild's exit code goes into the merge report too.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `container-deployment`: "Broken code does not produce an image" says the image build runs the
  tests as a CI run with CI timing limits, and that local runs keep the strict limits.

## Impact

- `Dockerfile` (build stage only).
- `TEAM-SETUP.md` (section 5 rule; also the report format line, which gains the docker build).
- No change to `src/`, tests, the game or the save.
- Routing: tooling (ui-worker).

## Non-goals

- Changing the speed guard's limits, or moving it out of the default test run.
- Making the simulation faster.
- CI workflow changes. GitHub runners already set `CI`.
