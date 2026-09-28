# Design: stable-news-ticker

## Context

See proposal.md - Why. What we found in the code:

- `NewsTicker.svelte` is a flex `<p class="ticker">` with the newspaper art and one `<span
  class="headline">` inside a `{#key shown}` block for the fade-in. Its only height rule is
  `min-height: 2.5em`, so the headline's line count sets the height.
- The ticker is rendered from `App.svelte` directly under the top bar, above the tabs, so its height
  moves everything below it.
- Headline keys: `headline.satire.*`, `headline.hint.*`, `headline.event.*`, listed via `SATIRE`,
  `HINTS` and the counter-event ids in `content/headlines.ts` / `megaMeatEvents.ts`; the content
  test already builds the full key list.
- Longest texts: DE `headline.event.adCampaign` 106 characters, then 99 and below; EN at most 85.
  At 320 px the headline column is about 220 px wide at 0.9rem, roughly 30 characters per line,
  so 100 characters need up to 4 lines.

**src/game/ files and content entries:** `content/headlines.ts` gains nothing; the key list the test
uses may move into an exported `ALL_HEADLINE_KEYS` so the ticker can reuse it.

## Goals / Non-Goals

**Goals:**
- Height depends only on the language and the viewport width, never on which headline is shown.
- No JavaScript measuring and no resize listeners.

**Non-Goals:**
- Making the ticker shorter on phones than the longest headline needs.

## Decisions

### 1. Stack every headline in one grid cell

The headline area becomes `display: grid`, and every headline of the current language is rendered
into the same cell (`grid-area: 1 / 1`). All but the current one get `visibility: hidden`. A grid
cell is as tall as its tallest item, so the area always has the height of the longest headline at
the current width and font, and the browser recalculates it on resize and language switch for
free. Hidden items are not in the accessibility tree, so the `aria-live` region still announces only
the shown headline. The current headline keeps its `{#key}` fade-in.

About 30 short spans are cheap; they only re-render on language change.

- *Alternative: clamp to two lines with an ellipsis.* Rejected: cuts off punchlines (see proposal).
- *Alternative: a fixed `min-height` in lines per breakpoint.* Rejected: a guess that breaks as soon
  as a longer headline or a different font metric appears; the grid stack is exact.
- *Alternative: measure all headlines with JavaScript.* Rejected: needs resize and font-load
  handling that the grid gives for nothing.

### 2. 100-character cap as a content test

`content.test.ts` checks every headline key in both dictionaries for at most 100 characters. The
German ad-campaign headline becomes "EILMELDUNG: MegaMeat plakatiert „Echte Männer essen Fleisch“.
Echte Männer zucken mit den Schultern." (exactly 100), keeping the punchline.

### 3. Phones

No extra rules: at 320 px the tallest headline sets about 4 lines. If that feels heavy, a later
change can lower the ticker's font size on phones; the grid stack keeps working either way.

## Risks / Trade-offs

- [The ticker is always as tall as the longest headline, even while a short one shows] → That is
  the price of not moving; the cap keeps it to at most 4 lines at 320 px and 1–2 lines on desktop.
- [A future headline added without checking length] → The content test fails the build above 100
  characters.

## Migration Plan

No data migration. Roll back by reverting the commit.
