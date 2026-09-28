# Proposal: github-pages-deploy

## Why

The game is static files with no backend and saves in localStorage, its build already uses
relative asset URLs (`base: './'`, for the itch.io iframe), and its legal pages and tabs route by
URL hash, so it can be served from GitHub Pages as it is. Today the only ways to publish are a
manual zip upload to itch.io and the Docker image for leberkas.org; there is no CI and the
repository has no GitHub remote yet. GitHub Pages gives a free, always-on public URL that
rebuilds on every push to `main`, so playtesters get the latest state without anyone running a
container, and leberkas.org can point at it if the user wants that instead of a hosted container.

The concept doc's section 8 sequence plans deployment in row 13 (`release-v1`: itch.io and
leberkas.org) and section 7.6 says "CI automation comes later"; this change brings that CI
forward as a third target next to the container and the itch.io zip.

## What Changes

- **Deploy workflow** `.github/workflows/pages.yml`: on every push to `main` and on manual
  dispatch, install with `npm ci`, run `npm run check`, `npm test` and `npm run build`, and
  publish `dist/` to GitHub Pages with the official Pages actions. A failing check, test or build
  publishes nothing (as the container's "broken code does not produce an image").
- **Operator details** for the Impressum come from repository variables with the same names the
  container uses (`LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`, `LEGAL_COUNTRY`,
  `LEGAL_EMAIL`, `LEGAL_HOSTING_PROVIDER`): the workflow writes `dist/legal.json` from them.
  While any is unset, the placeholder file from `public/` stays and the workflow prints a warning
  annotation, mirroring the container's start-up warning.
- **Developer page** off by default: the workflow writes `dist/dev.json` as `{"enabled":false}`,
  or `{"enabled":true}` when the repository variable `DEV_TOOLS` is `true`, so a playtest
  deployment can show `#dev` like the container does.
- **Custom domain** optional: when the repository variable `PAGES_CNAME` is set (e.g.
  `leberkas.org`), the workflow writes it to `dist/CNAME`; DNS is the user's.
- README gains a "GitHub Pages" section (enable Pages with source "GitHub Actions", set the
  variables, where the URL is, what Pages cannot do that the container does); concept doc
  section 7.6 lists Pages as a target.

## Non-goals

- Replacing the Docker image or the itch.io zip; both stay as they are.
- Security headers, custom cache headers and anonymised access logs: GitHub Pages does not offer
  them (it caches the page for up to 10 minutes and serves gzip on its own); the container spec
  keeps those requirements for leberkas.org-as-container.
- Creating the GitHub repository or pushing the code: a one-time step for the user, listed in
  the tasks as a prerequisite, not automated.
- Deploying from branches other than `main`, preview deployments, or a staging site.

## Capabilities

### New Capabilities
- `github-pages-deploy`: the workflow, what it publishes, the operator details, the developer
  switch and the optional custom domain on GitHub Pages.

### Modified Capabilities
<!-- none: the container-deployment requirements are unchanged; they apply to the container only -->

## Impact

- New: `.github/workflows/pages.yml`. No change to `src/`, `vite.config.ts`, `index.html`, the
  Dockerfile or `compose.yaml`.
- `README.md` (new section), `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`
  section 7.6.
- Prerequisites the user does once: push the repository to GitHub, set Pages to "GitHub Actions"
  in the repository settings, set the `LEGAL_*` repository variables (public values; the
  Impressum is public anyway).
- Tooling/docs only; no game logic, balance or UI code. Routing: ui-worker or implementation-
  worker, whichever is free; no simulation gates.
