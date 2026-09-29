# Design

## Context

See proposal.md, Why. Measured by the product-owner at 1280 × 800 with a 90-minute simulated save
(all three chains, 9 resource rows), on main at 803b3e6:

- `main.tab-content` has overflow and scrolls (clientHeight 534, scrollHeight 1,685), but
  `document.documentElement.scrollHeight` is 1,851. The elements reaching the page bottom are
  `.tab-body` → `section.panel` → `.table` of `BulkBuyersPanel`. So the tab body's height leaks
  into the page, even though the content area also scrolls. The likely cause is a grid or flex
  track that sizes to its content (a missing `min-height: 0` or a fixed track), or the
  `position: sticky` share bar. The worker finds the cause. The spec only fixes the outcome.
- A desktop row is about 125 px. `BulkOfferCell` stacks the price line, a flood line (reserved
  even at 100 %), a button of two or three text lines (`min-height: 44px` on all widths), and
  MegaMeat's cost line.
- At 375 px the page is 2,793 px tall. Phone rows are about 180 px.

No `src/game/` file or content entry is added or changed. The change touches only
`src/ui/BulkBuyersPanel.svelte`, `src/ui/BulkOfferCell.svelte` and, if the leak starts there,
the tab layout component that owns `main.tab-content`.

## Goals / Non-Goals

**Goals:** the page never scrolls at 1280 × 720 and up; about 3× denser bulk rows on desktop and
about 2× on phones; the sticky share bar is clean.

**Non-Goals:** a new visual style for the panel; virtual scrolling; hiding rows.

## Decisions

1. **One grid, one line per row at ≥ 1024 px.** Each buyer column becomes a subgrid of fixed
   tracks: price · flood slot · button · cost (the cost track only for MegaMeat). Fixed tracks keep
   every row aligned and the layout stable when numbers change, and they need no JS measuring.
   The alternative, flexible text in each cell, re-wraps as numbers grow and breaks the
   stable-layout scenarios.
2. **The flood slot is inline and blank at 100 %.** The slot keeps its width (for example, a
   meter of about 48 px plus "33 %" and "1:45" in tabular digits). It shows nothing while the
   market is fresh. A blank slot of fixed width keeps the stable-layout promise without spending a
   line on it.
3. **Single-line button on wide screens.** "20.2K → €6.30K" in one line, height about 32 px on
   desktop (44 px stays the minimum below 768 px, a touch target). An unavailable button keeps its
   size and shows a dash, as today.
4. **Below 1024 px: two lines.** Line 1 is the resource and its stock. Line 2 holds the buyer cells
   side by side. Each cell is its price and flood slot above its button, and MegaMeat's cost goes
   into the button as a second, smaller line. This fits 64 px at 768–1023 px and 100 px at 375 px.
5. **Sticky share bar.** It uses an opaque background (the panel's paper colour), sits at `top: 0`
   of the scrolling area with a z-index above the rows, and gets enough padding that the chain
   separator under it is hidden, not drawn over it. Whether the chain label repeats in the bar is
   left open (the worker may do it), but it's not required.
6. **Page overflow fix at the source.** Constrain the scrolling area's track (for example,
   `min-height: 0` on the flex/grid children down to `main.tab-content`), rather than setting
   `overflow: hidden` on `body`. Hiding would only hide the second scroll bar, and content could
   still be cut off.

## Measurable checks (for the worker and validator)

At each of these widths, with the 90-minute save and all chains unlocked, measure in the browser
(`getBoundingClientRect` on each row, `document.documentElement.scrollHeight`):

| Viewport | Page scrolls? | Max row height |
|---|---|---|
| 1280 × 720 | no (scrollHeight = clientHeight) | 48 px |
| 1280 × 800 | no | 48 px |
| 900 × 800 | as today on small screens | 64 px |
| 375 × 740 | page may scroll (phone layout) | 100 px, buttons ≥ 44 px |
| 320 × 640 | page may scroll | 100 px, no horizontal scroll |

These are the acceptance criteria. The row-height limits may go up by 4 px if a font's line box
needs it; log that in this file.

## Risks / Trade-offs

- [The one-line row gets tight in German ("Hafer-Cappuccino", "Tierfutter")] → the resource name
  truncates with an ellipsis and full text as a tooltip. Numbers never truncate.
- [MegaMeat's cost beside the button is easy to overlook] → it keeps its warning colour and icons.
  The "pays more" mark never hides it, as before.
- [The page overflow fix touches the shared tab layout] → the worker checks every tab at 1280 × 720
  for no page scroll and for no cut-off content.

## Migration Plan

None. UI only, no save change.

## Measured results (ui-worker, 2026-09-29)

With a 90-minute simulated save (`simulate({ minutes: 90, clicksPerSecond: 2 })`, 9 resource rows),
Vite dev server in the worktree, DE and EN measured separately (identical row heights):

| Viewport | Page scrollHeight / clientHeight | Tab content client / scroll | Max row height | Min sell button |
|---|---|---|---|---|
| 1280 × 720 | 720 / 720 (no page scroll) | 454 / 929 | 41 px | 30 px |
| 1280 × 800 | 800 / 800 (no page scroll) | 534 / 929 | 41 px | 30 px |
| 1024 × 768 | 768 / 768 | 492 / 1,014 (DE) | 46.9 px | 28 px |
| 900 × 800 | 800 / 800 | 526 / 1,150 (DE) | 63.9 px | 28 px |
| 768 × 800 | 800 / 800 | 494 / 1,248 (DE) | 63.9 px | 28 px |
| 375 × 740 | 2,056 / 740 (DE; was 2,793) | page scrolls | 80 px | 44 px |
| 320 × 640 | 2,286 / 640 (DE) | page scrolls | 80 px | 44 px |

No horizontal scroll at any width. Before the fix at 1280 × 800: page 1,686 / 800, rows 122 px.
Every tab at 1280 × 720 keeps the page at 720 / 720 (Produktion, Verkauf, Verbesserungen,
Lebenshof, Aktionen, Einstellungen). Flooding MegaMeat's soybean market from 100 % to 8 % fills the
empty flood slot and moves 0 of the table's row and button boxes at 1280, 1024, 900 and 375 px;
switching the share moves 0 boxes. Scrolled halfway at 1280 × 800, 1280 × 720 and 900 × 800, only
the tab strip lies above the opaque bar and the first row below it is fully visible.

## Implementation Notes

- **Cause of the page scroll:** not a flex or grid track. The bulk cells' `.visually-hidden` texts
  are `position: absolute`, and no ancestor inside the scrolling `main.tab-content` was
  positioned, so their containing block was the page: they sat at their static position far down
  the table and stretched the document (14 of them, down to 1,686 px). Fix at the source:
  `.tab-content { position: relative }` in `App.svelte`, which makes the scrolling area their
  containing block; they now scroll and clip with the tab. Every other absolutely positioned
  element inside a tab already had a positioned ancestor inside it, so nothing else moves.
- **One line from 1280 px, not 1024 px (deviation, row limit kept):** beside the 240 px stock rail
  the table gets about 711 px at 1024 px, while one line with German thousands ("17,2 Tsd. →
  46,0 Tsd. €") plus price, flood slot and cost needs about 880 px. From 1024 to 1279 px each
  cell puts price and flood slot on a small line above a 28 px button, with MegaMeat's cost still
  beside the button, and the resource stays on the left. Rows stay at most 47 px, within the 48 px
  limit, so the wide-screen goal (dense rows, no page scroll) holds at every width ≥ 1024 px.
- **"Per unit" said once on wide screens:** from 1024 px the cells show the bare price ("€4.20")
  and each buyer column's header carries a small caption (`bulk.perUnitCaption`: "Prices per
  unit" / "Preise je Stück"); the "/unit" suffix stays as screen-reader text. Below 1024 px the
  cells have room and show "€4.20/unit" again.
- **Buyer columns weighted:** MegaMeat's column is 1.35× the biogas plant's (its cost track), the
  resource column 0.5×; built from `BUYERS`, so a third buyer still gets a column.
- **Sticky bar:** opaque, `top: -8px` to cover the tab's 8 px top padding (the strip where the chain
  label showed through), z-index above the rows. The scandal line moved into the bar beside the
  share choice from 768 px (its reserved slot now fills the bar's spare width instead of an empty
  line above it); on phones it stays above the bar so the sticky bar stays one control tall.
- **Row below the bar fully visible:** the tab's content area snaps with `scroll-snap-type: y
  proximity` (App.svelte), and only bulk rows and chain labels opt in with `scroll-snap-align`
  and a `scroll-margin-top` bound to the bar's measured height. Other tabs have no snap targets and
  scroll as before. Phones scroll the page, which has no snapping; there the bar only has to stay
  visible, as the phone scenario asks.
- **Phones:** MegaMeat's cost is the button's third line (units, price, cost), so rows are 80 px.
- New i18n key `bulk.perUnitCaption` (DE and EN); no key removed.

