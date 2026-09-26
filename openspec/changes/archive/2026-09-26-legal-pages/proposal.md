# Proposal

## Why

Once the game is public on leberkas.org, German law requires an Impressum (§ 5 DDG) that is easy
to find and always reachable. Because the web server sees visitors' IP addresses, the GDPR also
requires a privacy policy (Datenschutzerklärung). A cookie banner is deliberately **not** part of
this change: the game sets no cookies, uses no analytics or third-party content, and only stores
what the player needs (language choice, later the savegame) in their own browser. That storage is
strictly necessary under § 25 (2) TDDDG, so there is nothing to consent to. This change is an
interim addition outside the numbered sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`, needed before `release-v1` (13).

## What Changes

- A footer, always visible, with links to **Impressum** and **Datenschutz** (EN: "Legal notice",
  "Privacy").
- Two in-game pages, each also reachable directly via `#impressum` and `#datenschutz`, so they can
  be linked from itch.io and elsewhere. Opening them never interrupts or resets the game.
- The operator's details (name, address, email, hosting provider) are **not** built into the game.
  They are read at runtime from a small `legal.json`. The Docker container writes that file at
  start-up from environment variables set in `compose.yaml`, with obvious placeholder defaults
  (Max Mustermann, …) and a warning in the container log while placeholders are in use.
- The nginx access log **anonymizes client IP addresses** (last IPv4 octet, last 80 IPv6 bits
  zeroed), so the server keeps no full IPs. The privacy policy can then state this truthfully.
- The German legal text is authoritative; the English pages are marked as a courtesy translation.

## Capabilities

### New Capabilities

- `legal-pages`: the footer, Impressum and privacy pages, direct links, runtime-loaded operator
  details, and the guarantee that the game sets no cookies and contacts no third parties.

### Modified Capabilities

- `container-deployment`: adds requirements for configuring the operator details through
  environment variables, and for anonymized IP addresses in access logs.

## Non-goals

- A cookie or consent banner (see Why). It must be added only if tracking, ads or third-party
  embeds are ever introduced.
- Legal review. The texts are a careful draft based on the facts of this setup, not legal advice;
  the author should have them checked before release.
- Real operator details: set later via environment variables.
- Legal details inside the itch.io zip, which has no container to generate `legal.json`:
  `release-v1` (13) generates the file for that build.
- Savegame storage itself: `game-state-and-save` (3). The privacy text already covers "game
  progress stored in your browser" so it stays accurate once saving exists.

## Impact

- New UI: footer, legal page view, hash-based navigation (`#impressum`, `#datenschutz`).
- New content: German and English legal texts; new translation keys.
- New files: `public/legal.json` (dev defaults), `docker/40-legal-json.sh` (entrypoint script).
- Changed: `docker/nginx.conf` (anonymized log format, `legal.json` location), `Dockerfile`,
  `compose.yaml` (environment variables with defaults), `README.md` (how to set them).
- No changes to game state or `tick()`.
