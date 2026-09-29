# pr-preview-deploy Specification

## Purpose
Publishes a playable build of every pull request on GitHub Pages under its own path and links it in
the pull request, so a feature can be tested without checking out the branch.

## Requirements

### Requirement: Preview per pull request
The repository SHALL contain a GitHub Actions workflow that, when a pull request from a branch of
this repository is opened, reopened or receives new commits, installs the dependencies from the
lock file, runs the type check, the tests and the production build, and publishes the build to the
`gh-pages` branch under `preview/pr-<N>/`, where `<N>` is the pull request number. A newer run for
the same pull request SHALL replace a running or queued one. When the check, the tests or the build
fail, nothing SHALL be published and the pull request's previous preview SHALL stay online. Pull
requests from forks SHALL get no preview. Publishing a preview SHALL NOT change the live game at the
site root or any other pull request's preview.

#### Scenario: New pull request
- **WHEN** a pull request #12 is opened from a branch of this repository and check, tests and build
  pass
- **THEN** the game of that branch is served at `<site>/preview/pr-12/` within minutes, with its
  scripts, styles and fonts loading, and the game at `<site>/` is unchanged

#### Scenario: New commits
- **WHEN** a new commit is pushed to the branch of the open pull request #12
- **THEN** `<site>/preview/pr-12/` serves the new build

#### Scenario: Red build
- **WHEN** a commit on the branch of pull request #12 fails a test
- **THEN** the workflow fails, nothing is published, and `<site>/preview/pr-12/` still serves the
  previous build

#### Scenario: Fork
- **WHEN** a pull request is opened from a fork
- **THEN** no preview is published and the workflow does not fail because of it

### Requirement: Preview link in the pull request
After a preview is published, the workflow SHALL post a comment with the preview URL in the pull
request. Later runs SHALL update that same comment instead of adding new ones. The URL SHALL use the
custom domain when the repository variable `PAGES_CNAME` is set, and the repository's Pages URL
otherwise.

#### Scenario: Link after first deploy
- **WHEN** the first preview of pull request #12 is published and `PAGES_CNAME` is `leberkas.org`
- **THEN** the pull request shows one comment linking `https://leberkas.org/preview/pr-12/`

#### Scenario: Update keeps one comment
- **WHEN** three more commits are pushed and each is published
- **THEN** the pull request still has exactly one preview comment

### Requirement: Preview removal
When a pull request is closed or merged, the workflow SHALL remove its `preview/pr-<N>/` folder from
the `gh-pages` branch and update the preview comment to say the preview was removed.

#### Scenario: Merged
- **WHEN** pull request #12 is merged
- **THEN** `<site>/preview/pr-12/` no longer serves the game and the live game and other previews
  are unchanged

### Requirement: Preview runtime files
Each preview SHALL carry `legal.json` written from the same `LEGAL_*` repository variables and with
the same placeholder fallback and warning as the live deployment, and `dev.json` as
`{"enabled":true}`, so `#dev` opens the developer page on every preview. A preview SHALL NOT contain
a `CNAME` file.

#### Scenario: Developer page on a preview
- **WHEN** the author opens `<site>/preview/pr-12/#dev`
- **THEN** the developer page opens, while `<site>/#dev` still follows the `DEV_TOOLS` variable

#### Scenario: Impressum on a preview
- **WHEN** all `LEGAL_*` variables are set and the author opens `<site>/preview/pr-12/#impressum`
- **THEN** the Impressum shows the real operator details

### Requirement: Separate browser storage per preview
A game served from a path containing `/preview/pr-<N>/` SHALL keep its save, backup, language and
theme under storage keys of its own for that `<N>`, so it never reads or overwrites the storage of
the live game or of another pull request's preview. A game served from any other path SHALL use the
same storage keys as before this change, so existing saves, language and theme choices load
unchanged.

#### Scenario: Preview does not touch the live save
- **WHEN** a player with a live save opens `<site>/preview/pr-12/`, plays and switches to English
- **THEN** the preview starts a new game, and `<site>/` afterwards still loads the player's save in
  the language they chose there

#### Scenario: Two previews
- **WHEN** the author plays on `<site>/preview/pr-12/` and then opens `<site>/preview/pr-13/`
- **THEN** pull request 13's preview does not load pull request 12's save

#### Scenario: Existing saves stay
- **WHEN** a player who saved before this change opens `<site>/`, the container, or the dev server
- **THEN** their save, language and theme load as before

#### Scenario: Theme on first paint
- **WHEN** the author chose the dark theme on `<site>/preview/pr-12/` and reloads it while the live
  game uses the light theme
- **THEN** the preview's first frame is already dark
