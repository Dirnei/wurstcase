# Proposal

## Why

To try a feature today, the author has to check out the PR branch and run it locally. Every pull
request should get its own playable build on GitHub Pages, linked in the PR, so a feature can be
tested (also on a phone) with one click and without a local checkout.

This is infrastructure and does not match a row in the concept doc's change sequence (section 8);
it extends the Pages deployment that serves change 13 (`release-v1`, leberkas.org deployment).

## What Changes

- The GitHub Pages source of the repository switches from "GitHub Actions" to "Deploy from a
  branch" (`gh-pages`, root). A one-time manual step in the repository settings.
- `.github/workflows/pages.yml` keeps its trigger, checks, tests, build and runtime files, but
  publishes `dist/` to the root of the `gh-pages` branch instead of through `deploy-pages`, and
  leaves the `preview/` folder on that branch alone.
- New workflow `.github/workflows/pr-preview.yml`: on every opened, reopened or updated pull request
  it runs check, tests and build and publishes the build to `gh-pages` under `preview/pr-<N>/`,
  then posts or updates one comment in the PR with the preview link. When the PR is closed or
  merged, the preview folder is removed.
- Previews get `legal.json` from the same repository variables as the live site, `dev.json`
  switched on (so `#dev` works for playtesting), and never a `CNAME`.
- The game keeps browser storage per preview: a page served from `/preview/pr-<N>/` prefixes its
  storage keys, so a preview never reads or overwrites the live game's save, language or theme.
  Every other URL (live site, container, dev server) keeps today's keys, so existing saves are
  untouched.

## Capabilities

### New Capabilities
- `pr-preview-deploy`: per-pull-request preview builds on GitHub Pages, their PR comment and
  cleanup, and storage kept separate from the live game.

### Modified Capabilities
- `github-pages-deploy`: the push-to-main deployment publishes to the root of the `gh-pages` branch
  (needs `contents: write` instead of the Pages deployment permissions) and must keep existing
  previews.

## Impact

- Workflows: `.github/workflows/pages.yml` (changed), `.github/workflows/pr-preview.yml` (new).
- Code: a small storage-scope helper used by the save slots, the language and theme stores, and
  the theme boot script in `index.html`. No game logic, content or save format changes.
- Repository settings (manual, once): Pages source to `gh-pages` branch; Actions workflow
  permissions allow writes. The custom domain keeps working through the `CNAME` file on the branch.
- Dependencies: third-party actions `rossjrw/pr-preview-action@v1` and
  `JamesIves/github-pages-deploy-action@v4`.
- README "GitHub Pages" section is updated.

## Non-goals

- Previews for pull requests from forks (the workflow skips them; the author works in branches of
  this repo).
- Hiding previews: they are public URLs on the same domain as the live game.
- Separate storage between a preview and the preview of another PR beyond the per-PR prefix, or
  migrating/cleaning up a closed preview's leftover storage.
- itch.io uploads and the container deployment are unchanged.
