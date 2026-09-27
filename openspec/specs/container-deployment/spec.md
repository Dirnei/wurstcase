# container-deployment Specification

## Purpose

Packages the built game as a self-contained container image, so the exact production build can
be run locally with one command and deployed unchanged to a production host.

## Requirements

### Requirement: One-command local run
Running `docker compose up --build` in the repository root SHALL build the image and serve the
production build of the game at `http://localhost:8234`. The host port SHALL be changeable
through the `VEGLE_PORT` environment variable without editing any file.

#### Scenario: Fresh checkout
- **WHEN** a developer with Docker runs `docker compose up --build` in a fresh clone
- **THEN** opening `http://localhost:8234` shows the game with its play-time counter running

#### Scenario: Host port already in use
- **WHEN** port 8234 is taken and the developer runs `VEGLE_PORT=8480 docker compose up --build`
- **THEN** the game is served at `http://localhost:8480`

### Requirement: Image serves only the built game
The image SHALL contain and serve only the production build output. Source files, tests,
dependencies and build tooling SHALL NOT be present in the final image.

#### Scenario: Game page and assets
- **WHEN** a client requests `/`
- **THEN** the server responds 200 with the game page, and every script, stylesheet and icon it
  references also responds 200

#### Scenario: Source is not exposed
- **WHEN** a client requests `/src/main.ts` or `/package.json`
- **THEN** the server responds 404

#### Scenario: Missing file
- **WHEN** a client requests a path that does not exist, such as `/does-not-exist.js`
- **THEN** the server responds 404 rather than returning the game page

### Requirement: Broken code does not produce an image
Building the image SHALL fail if the automated tests, the type check or the production build
fail.

#### Scenario: Failing test
- **WHEN** a test in the suite fails and the image is built
- **THEN** the build stops with an error and no new image is produced

### Requirement: New releases reach players immediately
The game page SHALL be served so that browsers check for a new version on every load.
Fingerprinted build assets (file names containing a content hash) SHALL be cacheable for one year
and marked immutable.

#### Scenario: Game page caching
- **WHEN** a client requests `/`
- **THEN** the response carries `Cache-Control: no-cache`

#### Scenario: Fingerprinted asset caching
- **WHEN** a client requests a file under `/assets/`
- **THEN** the response carries `Cache-Control: public, max-age=31536000, immutable`

### Requirement: Compressed text responses
The server SHALL compress HTML, JavaScript, CSS, JSON and SVG responses for clients that accept
gzip.

#### Scenario: Gzip-capable client
- **WHEN** a client sends `Accept-Encoding: gzip` and requests the main script
- **THEN** the response carries `Content-Encoding: gzip`

### Requirement: Basic security headers
Every response SHALL carry `X-Content-Type-Options: nosniff` and
`Referrer-Policy: strict-origin-when-cross-origin`, and SHALL NOT reveal the server's version.

#### Scenario: Headers present
- **WHEN** a client requests `/`
- **THEN** both headers are present and the `Server` header contains no version number

### Requirement: Unprivileged container with health status
The container SHALL run its server as a non-root user, listen on port 8080, and report a Docker
health status that becomes `healthy` once the game is being served.

#### Scenario: Health after start
- **WHEN** the container has been started for 30 seconds
- **THEN** `docker inspect` reports its health status as `healthy`

#### Scenario: Non-root
- **WHEN** the process list inside the running container is inspected
- **THEN** the server processes do not run as `root`

### Requirement: Large request headers accepted
The server SHALL accept request header lines, including the `Cookie` header, of up to 32 KB and
serve the request normally. Header lines larger than 32 KB SHALL be rejected with status 400.

#### Scenario: Many localhost cookies
- **WHEN** a browser requests `/` with a 16 KB `Cookie` header from other apps on `localhost`
- **THEN** the server responds 200 with the game page

#### Scenario: Oversized header
- **WHEN** a client requests `/` with a 40 KB `Cookie` header
- **THEN** the server responds 400

### Requirement: Operator details from environment variables
The container SHALL build the operator details shown on the legal pages from the environment
variables `LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`, `LEGAL_COUNTRY`,
`LEGAL_EMAIL` and `LEGAL_HOSTING_PROVIDER` each time it starts. `compose.yaml` SHALL pass them
through with obvious placeholder defaults. While any placeholder default is in use, the container
SHALL log a warning at start-up. Values SHALL be shown exactly as given, including quotes and
umlauts.

#### Scenario: Defaults
- **WHEN** the container is started with `docker compose up` and no `LEGAL_*` variables set
- **THEN** the Impressum shows the placeholder details and the container log contains a warning
  that placeholder legal details are in use

#### Scenario: Real details
- **WHEN** the container is started with `LEGAL_NAME="Jörg \"Tofu\" Müller"`
- **THEN** the Impressum shows `Jörg "Tofu" Müller` and no placeholder warning is logged for the
  name

#### Scenario: Change without rebuild
- **WHEN** `LEGAL_EMAIL` is changed and the container is recreated without rebuilding the image
- **THEN** the Impressum shows the new email

#### Scenario: Fresh details after restart
- **WHEN** a player reloads the page after the operator details were changed
- **THEN** the player sees the new details, not a cached copy

### Requirement: Anonymized access logs
The server SHALL NOT write full client IP addresses to its access log. IPv4 addresses SHALL be
logged with the last octet set to 0, IPv6 addresses with all but the first 48 bits set to 0.

#### Scenario: IPv4 client
- **WHEN** a client with the address 172.24.0.1 requests `/`
- **THEN** the access log line shows 172.24.0.0 and not 172.24.0.1

### Requirement: Developer tools switch
The container SHALL serve the developer configuration from the environment variable `DEV_TOOLS`,
written each time it starts. Developer tools SHALL be enabled only when `DEV_TOOLS` is exactly
`true`, and disabled for any other value or when it is unset. `compose.yaml` SHALL pass
`DEV_TOOLS` through with the default `false`. While developer tools are enabled, the container
SHALL log a notice at start-up. The configuration SHALL NOT be cached by the browser.

#### Scenario: Default
- **WHEN** the container is started with `docker compose up` and no `DEV_TOOLS` set
- **THEN** the developer configuration says disabled and `#dev` shows the game

#### Scenario: Dev instance
- **WHEN** the container is started with `DEV_TOOLS=true`
- **THEN** `#dev` shows the developer page, and the container log contains a notice that
  developer tools are enabled

#### Scenario: Switch without rebuild
- **WHEN** `DEV_TOOLS` is changed from `true` to unset and the container is recreated without
  rebuilding the image
- **THEN** `#dev` shows the game after a reload
