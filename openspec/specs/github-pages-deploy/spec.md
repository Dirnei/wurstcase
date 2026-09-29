# github-pages-deploy Specification

## Purpose
Publishes the built game to GitHub Pages from the repository on every push to `main`, with the
operator details and developer switch the game reads at runtime.

## Requirements

### Requirement: Deploy on push to main
The repository SHALL contain a GitHub Actions workflow that, on every push to `main` and on
manual dispatch, installs the dependencies from the lock file, runs the type check, the tests
and the production build, and publishes the build output to the root of the `gh-pages` branch,
from which GitHub Pages serves the site. When the check, the tests or the build fail, nothing
SHALL be published and the previous deployment SHALL stay online. Publishing SHALL replace the
previous build at the root but SHALL keep the `preview/` folder with the pull request previews.
The workflow SHALL request only the permission the branch deployment needs (`contents: write`)
and SHALL cancel a queued deployment when a newer one starts. The published game SHALL work from
the repository's Pages URL (a sub-path) without any change to the build, because the build uses
relative URLs.

#### Scenario: Green push
- **WHEN** a commit is pushed to `main` and check, tests and build pass
- **THEN** the workflow publishes `dist/` and the Pages URL serves the new game within minutes

#### Scenario: Red push
- **WHEN** a commit is pushed to `main` and a test fails
- **THEN** the workflow fails at the test step, nothing is published, and the Pages URL still
  serves the previous deployment

#### Scenario: Sub-path
- **WHEN** the game is opened at `https://<owner>.github.io/<repo>/`
- **THEN** the page, its scripts, styles and fonts load, and `#impressum` opens the Impressum

#### Scenario: Previews survive a main deploy
- **WHEN** pull request #12 has a preview and a commit is pushed to `main`
- **THEN** the site root serves the new game and `<site>/preview/pr-12/` still serves the preview

### Requirement: Operator details from repository variables
The workflow SHALL write `dist/legal.json` from the repository variables `LEGAL_NAME`,
`LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`, `LEGAL_COUNTRY`, `LEGAL_EMAIL` and
`LEGAL_HOSTING_PROVIDER`, in the same JSON shape as `public/legal.json`, with values exactly as
given, including quotes and umlauts. While any of them is unset, the workflow SHALL leave the
placeholder `legal.json` from the build in place and SHALL print a warning annotation naming the
unset variables.

#### Scenario: Real details
- **WHEN** all seven variables are set and `LEGAL_NAME` is `Jörg "Tofu" Müller`
- **THEN** the deployed Impressum shows `Jörg "Tofu" Müller` and the workflow run shows no
  placeholder warning

#### Scenario: Defaults
- **WHEN** no `LEGAL_*` variable is set
- **THEN** the deployed Impressum shows the placeholder details and the workflow run carries a
  warning that placeholder legal details are in use

### Requirement: Developer page switch
The workflow SHALL write `dist/dev.json` as `{"enabled":false}`, or as `{"enabled":true}` when
the repository variable `DEV_TOOLS` is exactly `true`, so the deployed game follows the
dev-tools spec's rule that a built game shows `#dev` only when the server's configuration says
so.

#### Scenario: Off by default
- **WHEN** `DEV_TOOLS` is unset and a player opens `#dev` on the Pages URL
- **THEN** the game is shown as for any unknown address

#### Scenario: Playtest deployment
- **WHEN** `DEV_TOOLS` is `true` and the author opens `#dev` on the Pages URL
- **THEN** the developer page opens

### Requirement: Optional custom domain
When the repository variable `PAGES_CNAME` is set, the workflow SHALL write its value to
`dist/CNAME`, so GitHub Pages serves the game at that domain once its DNS points at GitHub Pages.
When it is unset, no `CNAME` file SHALL be published.

#### Scenario: leberkas.org
- **WHEN** `PAGES_CNAME` is `leberkas.org` and its DNS points at GitHub Pages
- **THEN** the game is served at `https://leberkas.org/` with HTTPS

#### Scenario: No domain
- **WHEN** `PAGES_CNAME` is unset
- **THEN** the game is served at the repository's Pages URL only
