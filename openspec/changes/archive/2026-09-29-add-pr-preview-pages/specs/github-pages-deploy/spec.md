# Spec Delta

## MODIFIED Requirements

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
