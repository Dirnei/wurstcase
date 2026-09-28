# Tasks

## 1. Headline length

- [x] 1.1 Add a check to `content.test.ts` that every headline key is at most 100 characters in
  `de.json` and `en.json`. Verify it fails on `headline.event.adCampaign` (DE, 106).
- [x] 1.2 Shorten the German `headline.event.adCampaign` to "EILMELDUNG: MegaMeat plakatiert
  „Echte Männer essen Fleisch“. Echte Männer zucken mit den Schultern." Verify the check passes.

## 2. Fixed-height ticker

- [x] 2.1 Export the full headline key list from `content/headlines.ts` (reuse it in the content
  test), and in `NewsTicker.svelte` render all headlines of the current language stacked in one grid
  cell, with only the current one visible and keeping its fade-in. Verify in the browser at 320 px
  that the ticker keeps the same height for a one-line headline, the longest German headline and a
  breaking-news headline, and that the Verkauf tab below does not move.
- [x] 2.2 Verify with a screen reader (or the accessibility tree in dev tools) that only the shown
  headline is exposed and new headlines are still announced.

## 3. Verification

- [x] 3.1 Run the tests, the type check and the production build and check they pass.
- [x] 3.2 Play-check in the browser in DE and EN at 1280 × 720, 900 px, 375 px and 320 px: the
  ticker height never changes while headlines rotate, every headline is readable in full, and
  switching language or resizing sets a new height once.
