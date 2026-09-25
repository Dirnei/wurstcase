# Proposal

## Why

The concept doc left the game's title open, with "Leverkas" as the working title. The title is
now chosen: **Wurst Case**, a pun on "worst case" and the Wurst missing from the game's vegan
products. It works in German and English and is short enough for a logo and store page. This
resolves the "Final game title" open item in section 9 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`; it is a small interim change
outside the numbered sequence in section 8.

## What Changes

- The game shows "Wurst Case" as its title in the header and the browser tab, in both German and
  English.
- The static page title shown before the game script loads is "Wurst Case".
- The README and the concept doc use "Wurst Case" as the game's name.
- The game gets its logo: the vector logo (`logo.svg`, traced from the author's artwork) is shown
  next to the title in the header and replaces the placeholder 🌱 favicon.
- **Leverkas stays**: it remains the Act 1 flagship product and the subject of the Act 1 lawsuit;
  only its role as the game's title ends.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The localization spec only requires the tab title to be the game title in the selected
language; the title text itself is content, so no requirement changes. The change sets
`skip_specs: true`.

## Non-goals

- Renaming the repository, the npm package, the Docker image or the compose project (`vegle`).
  None of them are visible to players.
- A title-screen design, a "Wurst Case Scenario" tagline, a small-size simplified icon, or real SVG
  gradients replacing the traced color bands: later, with the art pass.
- Checking or registering domains or the itch.io page name: `release-v1` (13).

## Impact

- `src/i18n/de.json`, `src/i18n/en.json` (`app.title`), `index.html`, `README.md`,
  `src/assets/logo.svg` (new), `src/ui/Header.svelte`, `public/favicon.svg` (removed),
  `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`.
- `openspec/config.yaml` project context gains the title so future proposals use it.
- No code or behavior changes beyond the displayed text and logo.
