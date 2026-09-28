# Design: github-pages-deploy

## Context

See proposal.md - Why. What we found:

- `vite.config.ts` sets `base: './'`; `index.html` and the Svelte app use hash routes
  (`src/ui/route.svelte.ts`, `src/legal/route.ts`), so a sub-path deployment needs no 404
  fallback and no base-path change.
- The built game fetches `./legal.json` (`src/ui/legal.svelte.ts`) and `./dev.json`
  (`src/dev/enabled.ts`) at runtime with `cache: 'no-cache'`. In the container, nginx serves both
  from `/tmp`, written at start by `docker/40-legal-json.sh` (from `LEGAL_*` env vars, with a
  placeholder warning) and `docker/41-dev-json.sh` (from `DEV_TOOLS`). `public/legal.json` is the
  placeholder that ends up in `dist/`; there is no `public/dev.json`, so a missing file counts as
  disabled.
- `package.json` scripts: `check` (svelte-check + tsc), `test` (vitest run), `build` (vite
  build). No `engines` field; the Dockerfile pins the Node version used for the image.
- The repository has no `.github/` directory and no git remote.

**src/game/ files and content entries:** none. Files: `.github/workflows/pages.yml` (new),
`README.md`, the concept doc's section 7.6.

## Goals / Non-Goals

**Goals:**
- One workflow file; the game and the container are untouched.
- The same variable names as the container, so the user configures the Impressum once in their
  head.

**Non-Goals:**
- Reproducing the container's headers, caching or log anonymisation (Pages cannot).

## Decisions

### 1. Generate `legal.json` and `dev.json` in the workflow, not in the build

The runtime files are the container's contract (`fetch('./legal.json')`), so the Pages
deployment fills the same contract: a workflow step writes both files into `dist/` after the
build, from repository variables. Alternatives:

- *Vite `define`/env at build time.* Would bake the details into the bundle and change how the
  game reads them, diverging from the container and the dev-tools spec ("requested only when
  `#dev` is opened").
- *Commit real details into `public/legal.json`.* Puts a person's address in git history and
  breaks the placeholder-by-default rule of the container spec.

Repository *variables* (not secrets) hold the details: the Impressum is public by law, secrets
would be masked in logs and cannot be read for a warning, and variables show in the settings UI.
The JSON is written with `jq -n --arg` (or Node) so quotes and umlauts are escaped exactly, as
`40-legal-json.sh` does.

*Applied with Node, not jq* (ui-worker, 2026-09-28): the step runs a small `node -e` script with
`JSON.stringify`. Node is guaranteed by `actions/setup-node` in the same job, the escaping is the
same, and the step can be dry-run on the development machine, where no working jq exists. The
placeholder warning names each unset variable; unlike the container script it does not also flag
`Muster`/`example.com` values, because a repository variable is only set when someone typed it.

### 2. Check and test before build, in one job

`npm ci` → `npm run check` → `npm test` → `npm run build` → upload → deploy, in a single job with
the `github-pages` environment and `concurrency: { group: pages, cancel-in-progress: true }`. The
tests take about ten seconds; a separate test job would only add a checkout. Node version: the
one the Dockerfile uses, read from `actions/setup-node` `node-version`, with npm cache on.

*Applied with `cancel-in-progress: false`* (validator finding, 2026-09-28): the spec asks to
cancel a *queued* deployment when a newer one starts; `true` would also abort a running
deployment. With `false`, GitHub still replaces the queued run and lets the running one finish,
as its Pages starter workflow does.

### 3. `CNAME` from a variable

GitHub Pages reads `CNAME` from the artifact; keeping it out of `public/` means a fork or a
playtest repo does not claim the domain by accident. DNS stays the user's; the README says which
records.

### 4. What Pages cannot do

Pages caches `index.html` for up to 10 minutes and sets its own headers; the container's
"immediately", security-header and anonymised-log requirements stay container-only. The README
states this so nobody expects them on Pages.

## Risks / Trade-offs

- [The repository is private or not on GitHub yet] → prerequisite task for the user; Pages on a
  private repo needs a paid plan, a public repo is free.
- [`npm run check` or the tests are red on `main` at the time of the first deploy] → the first
  run fails visibly; that is the intended gate, not a workflow bug.
- [Placeholder Impressum goes public on the first deploy] → the warning annotation, and the
  README tells the user to set the variables before enabling Pages.
- [Fonts or the chart library loaded from a path that assumes the root] → the sub-path scenario
  is the check; `@fontsource` and `uplot` are bundled, not CDN.

## Migration Plan

Nothing to migrate. Removing the workflow file and disabling Pages in the settings rolls back.
