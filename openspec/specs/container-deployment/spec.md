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
