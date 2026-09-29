# Design

## Context

`pages.yml` builds on every push to `main` and publishes with `actions/upload-pages-artifact` and
`actions/deploy-pages`. That method replaces the whole site on each deploy, so it cannot hold
extra builds next to the live game. A repository has one Pages site, so per-PR previews must live
in subfolders of that site. That only works when Pages serves a branch whose content the
workflows add to piece by piece.

The build already uses `base: './'` (vite.config.ts), so the same `dist/` works in any subfolder.

Browser storage is per origin (scheme + host), not per path. Previews at `<site>/preview/pr-N/`
share the origin with the live game at `<site>/`. Today the game uses the fixed keys
`vegle.save.0`, `vegle.save.1`, `vegle.save.latest`, `vegle.save.unreadable` (src/save/slots.ts),
`vegle.language` (src/ui/i18n.svelte.ts) and `vegle.theme` (src/ui/theme.ts, repeated in the
boot script in index.html).

## Goals / Non-Goals

**Goals:**
- One click from a PR to a playable build of it, updated on every push, removed on close.
- The live game, its URL and players' saves are unaffected.
- Everything stays in this repository; no second repo, no external host.

**Non-Goals:**
- Fork PRs, private previews, cleaning up storage of closed previews (see proposal).

## Decisions

### 1. Pages served from the `gh-pages` branch
The live game goes to the branch root, previews to `preview/pr-<N>/`. `pages.yml` replaces
`configure-pages` / `upload-pages-artifact` / `deploy-pages` with
`JamesIves/github-pages-deploy-action@v4` (`branch: gh-pages`, `folder: dist`,
`clean-exclude: preview/`), so a main deploy replaces the root but keeps all previews. Permissions
become `contents: write`; the `github-pages` environment block is dropped (it only served the
Actions source). Concurrency group `pages` stays as it is.

*Alternatives:* a second repo for previews (the user rejected pushing to two repos) and
Cloudflare/Netlify previews (external account, checks configured outside GitHub).

### 2. `rossjrw/pr-preview-action@v1` for previews
New `pr-preview.yml` on `pull_request` types `opened, reopened, synchronize, closed`:
- Job guard `if: github.event.pull_request.head.repo.full_name == github.repository` (fork PRs
  are skipped; they have no write token anyway).
- Permissions `contents: write`, `pull-requests: write`.
- Concurrency `pr-preview-${{ github.event.number }}`, `cancel-in-progress: true`.
- Steps checkout, Node 24 setup, `npm ci`, `npm run check`, `npm test`, `npm run build` and the
  runtime-files step run only when `github.event.action != 'closed'`.
- The action runs with `source-dir: dist`, `umbrella-dir: preview`, `action: auto` (deploy on
  open/sync, remove on close) and
  `pages-base-url: ${{ vars.PAGES_CNAME || format('{0}.github.io/{1}', github.repository_owner, github.event.repository.name) }}`
  so the comment links the custom domain when there is one. The action keeps one sticky comment
  and pushes with `force: false`, using the same deploy action under the hood.

The action hardcodes the `pr-` prefix; the user accepted `preview/pr-<N>/`.

### 3. Shared runtime-files script
The `Write runtime files` shell block moves unchanged into `.github/scripts/write-runtime-files.sh`
(run with `bash`, reading the same env vars). `pages.yml` calls it with `DEV_TOOLS` and
`PAGES_CNAME` from repository variables, exactly as today. `pr-preview.yml` calls it with
`DEV_TOOLS=true` and an empty `PAGES_CNAME`, so previews get `legal.json` the same way, the
developer page switched on, and no `CNAME`. `pages.yml` additionally writes an empty
`dist/.nojekyll`, so the branch root has it and GitHub's branch build serves the files as they are
instead of running Jekyll (the root file covers the previews too).

### 4. Storage scope by URL path
New pure module `src/save/storage-scope.ts`:
- `storagePrefix(pathname: string): string`: returns `pr-<N>:` when `pathname` matches
  `/\/preview\/pr-(\d+)\//`, otherwise `''`.
- `scopedStorage(storage: StorageLike, prefix: string): StorageLike`: prefixes every key.

Wiring (one prefix computed from `location.pathname` at start-up):
- `src/ui/game.svelte.ts`: `createSaveSlots(() => scopedStorage(localStorage, prefix))`. The
  slots code itself is unchanged, including the unreadable-save backup key.
- `src/ui/i18n.svelte.ts` and `src/ui/theme.svelte.ts`: read and write `prefix + key`.
- `index.html` boot script: repeats the regex inline (same as it already repeats the theme key),
  with a comment to keep the two in step.

An empty prefix leaves every key exactly as today, so the live site, the container and the dev
server keep their saves. Matching `pr-<N>` (not just `preview/`) keeps two previews apart too.

*Alternative:* prefix by the full base path. Rejected: the live game at
`<owner>.github.io/<repo>/` (no custom domain) would get new keys and lose its saves.

### Files
- Changed: `.github/workflows/pages.yml`, `src/ui/game.svelte.ts`, `src/ui/i18n.svelte.ts`,
  `src/ui/theme.svelte.ts`, `index.html`, `README.md`.
- Added: `.github/workflows/pr-preview.yml`, `.github/scripts/write-runtime-files.sh`,
  `src/save/storage-scope.ts`, `src/save/storage-scope.test.ts`.
- No `src/game/` files and no content entries change; the save format and version are unchanged.

## Risks / Trade-offs

- [Two workflows push to `gh-pages` at once] → the deploy action retries a rejected push after
  fetching the branch again; a lost race fails the run visibly and a re-run fixes it.
- [Previews are public on the live domain] → accepted by the user; they carry the Impressum and
  are only linked from PRs.
- [Privacy text names the plain keys `vegle.language` / `vegle.theme`] → previews use prefixed
  keys; accepted for test builds, the live site stays accurate.
- [Third-party actions] → pinned to major versions `@v1` / `@v4` from well-known maintainers.
- [Branch grows with every deploy] → negligible for a static game of this size.
- [Switch-over gap] → see migration; the old Actions deployment keeps serving until the source is
  switched.

## Migration Plan

1. Merge the change. The next `pages.yml` run on `main` creates `gh-pages` with the game at the
   root. Until step 2, Pages keeps serving the last Actions deployment, so the site stays up.
2. Settings → Pages → Source: "Deploy from a branch", `gh-pages`, `/ (root)`. Check that the custom
   domain field still shows `leberkas.org` (the `CNAME` file on the branch sets it) and that HTTPS
   is enforced.
3. Open a test PR and check the comment link, the game, `#dev` and `#impressum` on the preview.

Rollback: set the Pages source back to "GitHub Actions" and revert the workflow change; the storage
prefix code is harmless without previews.

## Open Questions

- None blocking. If Actions' workflow permissions are set to read-only at repository level and a
  run fails with 403, set Settings → Actions → General → Workflow permissions to "Read and write".

## Implementation Notes

Notes from applying (ui-worker):

- `STORAGE_PREFIX` (the prefix of the loaded page) lives next to the pure helpers in
  `src/save/storage-scope.ts`; it falls back to `''` where `location` is missing (tests).
- `theme.svelte.ts` and `i18n.svelte.ts` prefix their keys once at module load; `THEME_STORAGE_KEY`
  in `theme.ts` stays the plain key, and its keep-in-step comment now names the preview pattern too.
- `write-runtime-files.sh` is committed executable but always run with `bash`, as the design says.
- Task 5.2 ran against `vite preview` serving the build at `/` and a copy at `/preview/pr-1/`: the
  preview started a new game under `pr-1:vegle.*` keys, and the plain `vegle.*` save, language and
  theme at `/` stayed byte-for-byte the same. The container runs the same `/` path and plain keys;
  it is rebuilt at merge.
- Task 5.3 needs the pushed branch and the repository settings, so it stays open for the user
  after merge.

### Validator notes folded in before merge

- **Pinned third-party actions:** `rossjrw/pr-preview-action@ffa7509e91a3ec8dfc2e5536c4d5c1acdf7a6de9`
  (`# v1.8.1`, the commit `v1` pointed to) and
  `JamesIves/github-pages-deploy-action@fa24774553152dd7873cd16ebd8d959b010c5445` (`# v4.9.0`, the
  commit `v4` pointed to), resolved with `git ls-remote` on 2026-09-29; both are lightweight tags,
  so the tag SHA is the commit. `actions/*` stay on `@v4`.
- **Build and deploy split:** both workflows have a `build` job (install, check, tests, build,
  runtime files) and a `deploy` job that gets `dist/` as a one-day artifact. On close,
  `pr-preview.yml` skips the build and its deploy job runs alone to remove the preview.
- **Least-privilege tokens:** both workflows default to `contents: read`. The build jobs, which run
  `npm ci` and the project's (or the pull request's) code, keep `contents: read`. Only the deploy
  jobs, which run no project code, may write: `pages.yml` with `contents: write`, `pr-preview.yml`
  with `contents: write` and `pull-requests: write` (the comment). This replaces the workflow-level
  write permissions of decisions 1 and 2.
- **No shared concurrency group:** a group keeps only one pending job, so a shared `gh-pages`
  group could silently cancel a waiting live deploy or a pull request's removal. Instead
  `pages.yml` keeps its own `pages` group (`cancel-in-progress: false`) and `pr-preview.yml` its
  per-PR group with cancel, as in decisions 1 and 2. Pushes that meet a newer `gh-pages` (the
  live deploy and a preview at the same moment) are non-fast-forward; both actions fetch and
  retry them, and the live deploy sets `attempt-limit: 5` (default 3). As the design's risk list
  says, a push that still loses fails the run visibly and a re-run fixes it.
- **No Dependabot previews:** both jobs of `pr-preview.yml` also require
  `github.actor != 'dependabot[bot]'`.
- **Test timeout (test only):** now that every deploy gates on `npm test`, every test in
  `src/game/balance/simulate.test.ts` that runs a 60-minute simulation inside the test gets an
  explicit 15 s timeout (`SLOW_SIM_TIMEOUT`): feeding the surplus to MegaMeat, "is deterministic"
  in "tempted by MegaMeat", rescuing animals, the flyers, the storeroom, the hydraulic press,
  better seeds, and the 60-minute speed guard (which keeps its own 4 s assertion). They take
  2–3 s locally, half the 5 s default, and one had hit it at 5,066 ms. The tempted describe's two
  shared runs happen at collection time, outside any test timeout. No other test file runs the
  simulation. No game code or balance numbers change.
- **Speed guard on CI (test only):** the "60-minute game in under 4 seconds" guard allows 10 s
  when `CI` is set (GitHub runners are about 1.5–2× slower) and keeps 4 s locally, so a slow
  runner cannot block a live deploy while local runs still catch a real slowdown.
