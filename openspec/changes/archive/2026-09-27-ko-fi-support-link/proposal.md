# Proposal

## Why

The game is a free hobby project. A visible but unobtrusive link to the author's Ko-fi page
(https://ko-fi.com/dirnei) lets players who enjoyed it support the work. It must not break the
game's privacy promise of no third-party requests.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is a small addition to the
footer from `legal-pages` and can land at any point in the sequence.

## What Changes

- **Support link in the footer:** a plain text link, "☕ Unterstütze mich auf Ko-fi" in German
  and "☕ Support me on Ko-fi" in English, pointing to https://ko-fi.com/dirnei. It sits on the
  opposite side of the footer from the legal links and wraps below them on narrow screens.
- **Opens in a new tab** so the running game stays open, with no referrer sent.
- **Text only:** no Ko-fi widget, button image or script, so the game still makes no requests
  to other hosts until the player clicks the link.
- **Privacy policy:** one sentence in the "Cookies und Tracking" section in DE and EN. It says
  that the footer links to Ko-fi, and that Ko-fi receives data only when a visitor follows the link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `legal-pages`: the always-visible footer also carries the support link, and the privacy policy
  content mentions the external link.

## Non-goals

- Ko-fi widgets, embedded buttons, overlays or any other third-party content.
- Support prompts inside the game (pop-ups, reminders, end-of-act messages).
- Making the support URL configurable for other operators. It is the author's link and part of the
  game.
- Other platforms (itch.io's own tip option is set up with the itch.io release in `release-v1`).

## Impact

- Changed: `src/ui/Footer.svelte` (support link, layout), `src/i18n/de.json` and `en.json`
  (`footer.support`), `src/legal/texts.de.ts` and `texts.en.ts` (one privacy sentence).
- No change to game logic, state or save format.
