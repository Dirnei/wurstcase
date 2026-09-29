# Wurst Case

A browser idle game with a vegan theme. Build a plant-based food empire, rescue
animals from MegaMeat Corp and give them a home on your Lebenshof. The concept lives in
[`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`](docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md);
detailed specs are managed with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in `openspec/`.

## Development

Requires Node 24.

```bash
npm install
npm run dev      # dev server with hot reload
npm test         # unit tests (Vitest)
npm run check    # type check (svelte-check + tsc)
npm run build    # production build into dist/
```

## Run the production build with Docker

Requires Docker with Compose.

```bash
docker compose up --build -d   # build the image and start it
docker compose down            # stop it
```

The game is then served at <http://localhost:8234>. The image build runs the tests and the type
check first, so it fails if either fails.

If port 8234 is already in use, choose another host port with `VEGLE_PORT`:

```bash
VEGLE_PORT=8480 docker compose up --build -d            # bash
$env:VEGLE_PORT=8480; docker compose up --build -d      # PowerShell
```

### Impressum and privacy details

The legal pages show the operator's details from environment variables. Without them the game
shows placeholders (Max Mustermann, …) and the container logs a warning at start-up. Put your real
details in a `.env` file next to `compose.yaml` (it is git-ignored, so they never get committed):

```bash
LEGAL_NAME=Erika Beispiel
LEGAL_STREET=Beispielweg 3
LEGAL_POSTAL_CODE=80331
LEGAL_CITY=München
LEGAL_COUNTRY=Deutschland
LEGAL_EMAIL=kontakt@example.org
LEGAL_HOSTING_PROVIDER=Beispiel Hosting GmbH, Beispielstraße 5, 10115 Berlin
```

Then apply them with `docker compose up -d` (no rebuild needed).

### Developer page

`#dev` shows a balancing page with cost, payback and demand charts and a simulated playthrough,
all computed from the current content. It is always on under `npm run dev`. In the container it
is off unless `DEV_TOOLS=true` is set, for example in `.env`:

```bash
DEV_TOOLS=true
```

Then recreate the container with `docker compose up -d` (no rebuild needed). The container logs
"developer tools enabled at #dev" while it is on. Builds without a server (such as the itch.io
zip) never show it.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the game on every push to `main` (and on
manual dispatch from the Actions tab). It runs `npm ci`, the type check, the tests and the build;
if any of them fails, nothing is published and the previous deployment stays online. It pushes the
build to the root of the `gh-pages` branch, which Pages serves, and leaves the `preview/` folder on
that branch alone.

One-time setup in the repository settings:

1. Settings → Actions → General → Workflow permissions: **Read and write permissions**, so the
   workflows may push to `gh-pages` and comment on pull requests.
2. Settings → Secrets and variables → Actions → **Variables**: add the operator details under
   the same names as in `.env`: `LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`,
   `LEGAL_COUNTRY`, `LEGAL_EMAIL`, `LEGAL_HOSTING_PROVIDER`. They are variables, not secrets: the
   Impressum shows them publicly anyway. While any of them is missing, the site shows the
   placeholders and the workflow run carries a warning naming the unset ones.
3. After the first green run of `pages.yml` has created the `gh-pages` branch: Settings → Pages →
   Build and deployment → Source: **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`.
   With a custom domain, check that the domain field still shows it (the `CNAME` file on the
   branch sets it) and that **Enforce HTTPS** is on. Until this switch, Pages keeps serving the
   last deployment of the old "GitHub Actions" source, so the site stays up.

After the first green run, the URL appears on the workflow run and under Settings → Pages,
normally `https://<owner>.github.io/<repo>/`. The build uses relative URLs and hash routes, so
it works from that sub-path unchanged.

Optional variables:

- `DEV_TOOLS=true` enables the developer page at `#dev`, as in the container. Unset, it is off.
- `PAGES_CNAME=leberkas.org` serves the game at that domain. Point the DNS at GitHub Pages first:
  an `A` (and `AAAA`) record for the apex at GitHub's Pages addresses, or a `CNAME` record for a
  subdomain at `<owner>.github.io`, as GitHub's Pages documentation lists them. Unset, no `CNAME`
  file is published, so a fork does not claim the domain.

What Pages does not do compared with the container: it caches pages for up to 10 minutes, sets
its own response headers (no custom security or cache headers), and offers no access logs. For
leberkas.org as a container, those requirements stay with the Docker image.

### Pull request previews

`.github/workflows/pr-preview.yml` builds every pull request from a branch of this repository
(opened, reopened, new commits) with the same check, tests and build, and publishes it to
`<site>/preview/pr-<N>/`. One comment in the pull request links the preview and is updated on
every run; closing or merging the pull request removes the preview. Pull requests from forks get
no preview.

Previews carry the same `legal.json` as the live site, always have the developer page on (`#dev`),
and never a `CNAME`. A preview keeps its save, language and theme under storage keys of its own
(`pr-<N>:vegle.*`), so it never reads or overwrites the live game's save or another preview's;
every other URL (live site, container, dev server) keeps the plain `vegle.*` keys.
