# Design: aligned-upgrade-buttons

## Context

See proposal.md - Why. What we found in the code:

- `UpgradesPanel.svelte`: `.offers` is `grid-template-columns: repeat(auto-fill, minmax(260px,
  1fr))`, so each row's items stretch to the tallest card. Each card (`li.card`) is a
  `48px 1fr` grid: art, then `.about` (name, effect, joke line), then the button spanning both
  columns in an implicit auto row. Its rows get no spare height, so the extra space collects at
  the bottom of the card, below the button.
- The button is a plain `.game-button primary` (min-height 32px, padding 4px 12px), and its text
  (`Buy: {price}`) may wrap on narrow cards.
- `BuildingCard.svelte` Buy buttons use `min-height: 30px; padding-block: 2px`, and 44px below
  768 px.

**src/game/ files and content entries:** none are added or changed.

## Goals / Non-Goals

**Goals:**
- Button position and height do not depend on the card's text.

**Non-Goals:**
- Changing the Produktion tab's buttons; they are the reference.

## Decisions

### 1. Two card rows: content `1fr`, button `auto`

The card gets `grid-template-rows: 1fr auto`. Art and `.about` sit in row 1, aligned to the top
(`align-self: start`); the button sits in row 2. Because the card is stretched to the row's
height, row 1 takes up all spare height and the button always ends up at the bottom of the card.

- *Alternative: `margin-top: auto` on the button in a flex column.* Rejected: the card's art and
  text are a two-column grid, and turning the card into a flex column would need an extra
  wrapper.
- *Alternative: a fixed card height.* Rejected: German text wraps to different heights, and a
  fixed height would clip it or waste space.

### 2. Button height from the Produktion tab

The buy button gets the same values as the building Buy button: `min-height: 30px; padding-block:
2px`, 44px below 768 px, plus `white-space: nowrap` so the price never breaks onto a second line.
The shortest card (260px minus padding) fits "Kaufen: 1,23 Mio. €" on one line at the button's
font size.

- *Alternative: a shared `.buy-button` class in `app.css`.* Considered, but only two places use
  it today and Aktionen / Lebenshof are out of scope; keep it local and revisit when those follow.

## Risks / Trade-offs

- [A card with much more text than its neighbours leaves a large gap above the button in the
  shorter cards] → Accepted; it is the same trade-off the Produktion tab makes, and the gap sits
  between text and button, where it reads as spacing.
- [A very long price (scientific form) overflowing the one-line button] → Check in the browser
  with a `1.23e15` price in German on the narrowest card; if it overflows, allow the label to
  shrink by a step instead of wrapping.

## Migration Plan

No data migration. Roll back by reverting the commit.
