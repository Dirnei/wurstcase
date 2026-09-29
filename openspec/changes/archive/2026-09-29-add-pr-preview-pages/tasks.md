# Tasks

## 1. Storage scope per preview

- [x] 1.1 Write `src/save/storage-scope.test.ts` first: `storagePrefix` returns `pr-12:` for
  `/preview/pr-12/`, `/wurstcase/preview/pr-12/` and `/preview/pr-12/index.html`, and `''` for
  `/`, `/wurstcase/`, `/preview/` and `/preview/foo/`; `scopedStorage` prefixes keys on
  `getItem`/`setItem` and passes an empty prefix straight through; the save slots over a scoped
  storage never touch the unprefixed `vegle.save.*` keys. Verify the new tests fail with
  `npm test`.
- [x] 1.2 Implement `src/save/storage-scope.ts` (`storagePrefix`, `scopedStorage`) and verify the
  tests from 1.1 pass.
- [x] 1.3 Wire the prefix from `location.pathname` into `src/ui/game.svelte.ts` (scoped storage for
  the save slots), `src/ui/i18n.svelte.ts` and `src/ui/theme.svelte.ts` (prefixed keys); verify
  `npm run check` and `npm test` pass.
- [x] 1.4 Update the boot script in `index.html` to compute the same prefix inline before reading
  the theme key, with a keep-in-step comment next to the one in `src/ui/theme.ts`; verify with
  `npm run build` and `npx vite preview` that `/` still reads `vegle.theme`.

## 2. Live deployment to the gh-pages branch

- [x] 2.1 Move the `Write runtime files` shell block unchanged into
  `.github/scripts/write-runtime-files.sh` and call it from `pages.yml` with the same env vars;
  verify locally with `bash .github/scripts/write-runtime-files.sh` against a fresh `dist/` that it
  writes `legal.json` / `dev.json` / `CNAME` as before for set and unset variables.
- [x] 2.2 In `pages.yml`, replace `configure-pages`, `upload-pages-artifact` and `deploy-pages`
  with `JamesIves/github-pages-deploy-action@v4` (`branch: gh-pages`, `folder: dist`,
  `clean-exclude: preview/`), write `dist/.nojekyll`, set permissions to `contents: write`, drop
  the `github-pages` environment, keep trigger, concurrency and the check/test/build steps; update
  the header comment. Verify the YAML parses (e.g. `node -e` with a YAML parser via `npx`, or
  `actionlint` if available).

## 3. Preview workflow

- [x] 3.1 Add `.github/workflows/pr-preview.yml` as in design decision 2: `pull_request` types
  `opened, reopened, synchronize, closed`, fork guard, `contents: write` + `pull-requests: write`,
  per-PR concurrency with cancel, check/test/build and runtime files (`DEV_TOOLS=true`, empty
  `PAGES_CNAME`) skipped on `closed`, then `rossjrw/pr-preview-action@v1` with `source-dir: dist`,
  `umbrella-dir: preview` and the `pages-base-url` expression. Verify the YAML parses.

## 4. Documentation

- [x] 4.1 Update the README "GitHub Pages" section: branch-based publishing, PR previews at
  `<site>/preview/pr-<N>/` with the dev page on, separate storage per preview, and the one-time
  switch-over steps from the design's migration plan (Pages source, custom domain check, workflow
  permissions). Verify the section reads correctly in the rendered Markdown preview.

## 5. Verification

- [x] 5.1 Run `npm run check`, `npm test` and `npm run build`; all pass.
- [x] 5.2 Play-check in the browser: rebuild the container (`docker compose up -d --build web`) and
  confirm the existing save, language and theme load unchanged at `/`. Serve `dist/` under a
  `/preview/pr-1/` path (e.g. copy `dist` into a scratch folder at `preview/pr-1/` and run
  `npx vite preview --outDir <scratch>`), then confirm it starts a new game, its theme and
  language choices do not change the ones at `/`, and a dark theme reload paints dark at once.
- [ ] 5.3 After merge (with the user): let `pages.yml` create `gh-pages`, switch the Pages source,
  confirm leberkas.org still serves the game over HTTPS, then open a test PR and confirm the
  preview comment, the game, `#dev` and `#impressum` at `/preview/pr-<N>/`, and that closing the PR
  removes the preview.
