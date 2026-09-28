# Proposal: stable-news-ticker

## Why

The news ticker sits above the tabs and is as tall as its current headline. On a 320 px phone a
short headline takes two lines and a long one three or four, so every 15 seconds the ticker
changes height (57 ↔ 79 px measured) and the whole tab below it jumps. It is the same flicker that
`stable-top-bar` and `stable-sales-layout` removed elsewhere.

Clipping long headlines to two lines is not an option: the satire's punchline sits at the end
("… Echte Männer zucken mit den Schultern."), so an ellipsis would cut off the joke.

The concept doc did not plan this change in its section 8 sequence. It is UI polish on the ticker
from `aktionen-and-megameat`.

## What Changes

- The ticker keeps one height: the height of the tallest headline in the current language at the
  current width. Shorter headlines sit in that reserved space; nothing below moves.
- Headlines are always shown in full; nothing is clipped.
- A content rule caps headlines at 100 characters in both languages, so the reserved height stays
  small on phones. One German headline (106 characters) is shortened to 100.

## Non-goals

- Scrolling or marquee text (the spec forbids sideways scrolling).
- Changing the rotation, the breaking-news behaviour or which headlines exist.
- Tap-to-expand headlines.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `news-ticker`: the Ticker line requirement adds the fixed height, the no-clipping rule and the
  100-character cap.

## Impact

- `src/ui/NewsTicker.svelte`: the headline area reserves the tallest headline's height.
- `src/i18n/de.json`: `headline.event.adCampaign` shortened.
- `src/game/content/content.test.ts`: the 100-character check.
- No change to `src/game/` rules, saves or balance.
