# Tasks

## 0. Prerequisites (the user, once)

- [ ] 0.1 Create the GitHub repository, add it as `origin` and push `main`. Verify `git remote -v`
  shows it and the code is on GitHub.
- [ ] 0.2 In the repository settings set Pages → Source to "GitHub Actions", and add the
  repository variables `LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`,
  `LEGAL_COUNTRY`, `LEGAL_EMAIL`, `LEGAL_HOSTING_PROVIDER` (and, if wanted, `DEV_TOOLS=true`,
  `PAGES_CNAME`). Verify they are listed under Settings → Secrets and variables → Actions →
  Variables.

## 1. Workflow

- [x] 1.1 Write `.github/workflows/pages.yml`: triggers `push` to `main` and
  `workflow_dispatch`; permissions `contents: read`, `pages: write`, `id-token: write`;
  concurrency group `pages` with cancel-in-progress; one job on `ubuntu-latest` with the
  `github-pages` environment: checkout, `actions/setup-node` (the Dockerfile's Node major, npm
  cache), `npm ci`, `npm run check`, `npm test`, `npm run build`. Verify locally with `act` if
  available, otherwise by reading it against the GitHub Pages starter workflow.
- [x] 1.2 Add the runtime-files step after the build: write `dist/legal.json` from the seven
  `LEGAL_*` variables with `jq -n --arg` when all are set, else keep the placeholder and emit
  `::warning::` naming the unset ones; write `dist/dev.json` as `{"enabled":true}` only when
  `DEV_TOOLS == 'true'`, else `{"enabled":false}`; write `dist/CNAME` only when `PAGES_CNAME` is
  set. Verify by running the step's shell locally against a `dist/` build with the variables
  exported (quotes and umlauts survive: `LEGAL_NAME='Jörg "Tofu" Müller'`).
- [x] 1.3 Add `actions/upload-pages-artifact` (path `dist`) and `actions/deploy-pages`, and
  expose the deployment URL as the job's environment URL. Verify the file passes
  `actionlint` if available, otherwise a YAML parse.

## 2. Docs

- [x] 2.1 README: add a "GitHub Pages" section (enable Pages with source GitHub Actions, the
  variables and that they are public values, where the URL appears, `DEV_TOOLS`, `PAGES_CNAME`
  and the DNS records, and what Pages does not do compared with the container: 10-minute page
  cache, no custom headers, no access logs). Verify by reading it next to the container section.
- [x] 2.2 Concept doc section 7.6: list GitHub Pages as a deployment target next to itch.io and
  the container and drop "CI automation comes later". Verify by reading the passage.

## 3. Verification

- [ ] 3.1 Push to `main` and watch the first run: check, tests and build green, artifact
  uploaded, deployment URL shown. Open the URL: the game loads with fonts and styles,
  `#impressum` shows the configured details (or placeholders with a warning in the run),
  `#dev` behaves as `DEV_TOOLS` says, and a save survives a reload.
- [ ] 3.2 Push a commit with a deliberately failing test on a branch merged to `main` (or use
  `workflow_dispatch` on such a commit) and verify the run stops at the test step and the
  previous deployment stays online; revert the commit.
- [x] 3.3 Run the tests, the type check and the production build locally and check they pass
  (nothing in the game changed, so this guards only against accidental edits).
