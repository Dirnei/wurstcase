# Proposal

## Why

The resource-row redesign of the bulk buyers (`redesign-bulk-selling-rows`, 689344c) did not fix
the scrolling, and it added a layout bug. Playtest and a browser check at 1280 × 800 with a
90-minute save show the following:

- **Double scroll bar on desktop.** The tab's content area scrolls (534 px visible, 1,685 px of
  content), but the page scrolls too: the document grows to 1,851 px, and scrolling it only shows
  empty background below the footer. This breaks "Screen fits without page scrolling".
- **Rows are still tall.** Each buyer cell stacks three things: its price, a flood meter line, and
  a sell button of two or three lines. A resource row is about 125 px on desktop, so 9 resources
  take about 1,150 px. On a 375 px phone the whole page is about 2,800 px.
- **The idle meter wastes a line.** Every MegaMeat cell shows a "100 %" meter even when its market
  is fresh.
- **The sticky share choice covers content.** While the rows scroll, the share choice sits on top
  of the first visible row, and the chain label shows above it.

This is a UI fix of the bulk buyers from the sales and customers work (concept doc section 8, row 5
`sales-and-customers`, reworked by `redesign-bulk-selling-rows`). It does not match a planned row
of its own.

## What Changes

- **No page scroll on the Verkauf tab.** At 1280 × 720 and larger only the tab's content area
  scrolls. The page never grows past the viewport, whatever the bulk rows' height.
- **One line per resource row on wide screens.** At 1024 px and wider, each row is one line:
  resource (icon, name, stock), then per buyer its price per unit, a flood slot, one single-line
  sell button ("20.2K → €6.30K") and, for MegaMeat, the awareness and scandal cost beside the
  button. A row is at most 48 px tall.
- **Flood figures inline, and blank at full level.** The flood level, meter and recovery time sit
  in a fixed-width slot on the cell's line, not on a line of their own. While a market is at
  100 %, the slot stays empty but keeps its width, so nothing moves when a market floods.
- **Compact phone and tablet rows.** Below 1024 px a row is the resource line plus one line of
  buyer cells side by side. MegaMeat's cost moves into its button as a second text line. A row is
  at most 64 px from 768 to 1023 px, and at most 100 px below 768 px. Buttons stay at least 44 px
  tall below 768 px.
- **The share choice bar doesn't cover rows.** While the rows scroll, the share choice stays in
  view on an opaque bar. No row or chain label shows above it or through it, and the first row
  below it is fully visible.
- **Tighter panel head.** The empty gap between the panel intro and the share choice is removed.
  The buyer header keeps illustration, name and line, and the line may be clamped to one line,
  with the full text as a tooltip.
- No change to what a row shows, the rules, prices, floods, the scandal, the share choice's
  behaviour or the save.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `game-screen`: the "Sales tab" requirement changes the bulk row layout to one line per row on
  wide screens, gives row-height limits per width, keeps the share choice bar from covering rows,
  and adds scenarios for no page scroll and row heights.
- `bulk-sales`: in "Flooded market", the flood figures sit in a reserved slot on the offer's line,
  and that slot stays empty while the market is at 100 %.

## Impact

- UI: `src/ui/BulkBuyersPanel.svelte`, `src/ui/BulkOfferCell.svelte`, and possibly the tab layout
  in `src/ui/` that holds the scrolling content area (where the page overflow comes from).
- i18n: at most a tooltip key for the clamped buyer line. No text is removed.
- Game logic: none. `src/game/` is not changed.
- Save format: unchanged.
- Routing: UI-only (ui-worker).

## Non-goals

- Hiding rows without stock. The rows stay stable, as `redesign-bulk-selling-rows` promised.
- Collapsing or moving the customer sales figures at the top of the Verkauf tab.
- Changing the Produktion tab or other tabs, beyond making sure the page-scroll fix doesn't break
  them.
- Any change to bulk prices, lots, floods or MegaMeat's costs.
