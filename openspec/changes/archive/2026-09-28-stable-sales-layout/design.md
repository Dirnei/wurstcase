# Design: stable-sales-layout

## Context

See proposal.md for the problem. What we found in the code:

- `formatNumber` in `src/format/number.ts` truncates and then strips trailing zeros in `truncate()`.
  So the character count of a figure depends on its value, not just on its magnitude.
- `SalesPanel.svelte` puts four sentences (`Customers: 12 of 1000 townspeople`, …) into a
  `flex-wrap` row, and the sold list into a `dl` with `max-content max-content` columns.
- `BulkBuyersPanel.svelte` renders each offer as an `inline-flex` button whose text is
  `{units} {resource} → {price}`, with the `<small>` lot note next to it in the same flex row.
  The buyer cards already sit in a stable `auto-fit, minmax(260px, 1fr)` grid.
- The `.game-button` class and the rail already use `font-variant-numeric: tabular-nums`. The UI
  font is Nunito Variable.

**src/game/ files and content entries:** none are added or changed. This change touches only
`src/format/`, `src/ui/` and `src/i18n/`.

## Goals / Non-Goals

**Goals:**
- Width of every live figure depends only on its magnitude, not on its fractional part.
- Layout containers on the Verkauf tab get their size from the grid, not from the text inside.

**Non-Goals:**
- Using the fixed form anywhere outside the Verkauf tab (see proposal Non-goals).
- A general-purpose stat-cell component shared with other tabs. Keep it local to the sales
  panel until a second user appears.

## Decisions

### 1. An option on `formatNumber` instead of a second formatter

Add `formatNumber(value, lang, { fixed: true })`. In fixed mode, `truncate()` skips the zero
stripping. Below 1,000 it uses 1 decimal, in the suffix range `3 - digitsBeforePoint`, and in the
scientific range 2. Everything else stays the same (ranges, epsilon, sign handling, `layer >= 2`
fallback).

- *Alternative: a separate `formatFixed` function.* Rejected because it would duplicate the
  normalisation and range logic that already has tests.
- *Alternative: always show fixed decimals.* Rejected because it would change every existing
  scenario (`12` → `12.0`) and clutter static prices like `€150`.

`src/ui/amounts.ts` gets `liveAmount(value)` and `liveEuros(value)` next to `amount` and
`euros`, so components never pass options around.

### 2. Tabular digits plus layout-owned widths, not `min-width` guesses on text

Fixed decimals alone make most widths stable. But `1` and `8` differ in width in proportional
fonts, and a magnitude change (`99.5` → `100.0`) still adds a character. So:

- Every value element gets `font-variant-numeric: tabular-nums`.
- Values sit in cells whose width comes from the grid track (`1fr`, or a fixed `minmax(…ch, …)`
  track), and are right-aligned. A longer value then grows to the left inside its own cell and
  pushes nothing else.
- Cells use `white-space: nowrap` and `overflow: hidden; text-overflow: ellipsis` on the label,
  never on the value.

- *Alternative: only `min-width` on the value spans.* Rejected. It hides the problem until a
  value outgrows the guess, then the old reflow comes back.

### 3. Sales figures: a 2 × 2 (desktop 4 × 1) stat grid with split label and value

`.numbers` becomes `display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`.
Each cell is a `<div>` holding a small muted label and a larger value line. This needs the
sentences split into label and value keys. The old sentence keys `sales.customers`,
`sales.orders`, `sales.demand` and `sales.income` are replaced by:

| Key | EN | DE |
|---|---|---|
| `sales.stat.customers` | Customers | Kundschaft |
| `sales.stat.customersValue` | {count} / {population} | {count} / {population} |
| `sales.stat.customersHint` | of {population} townspeople | von {population} Einwohnern |
| `sales.stat.orders` | Open orders | Offene Bestellungen |
| `sales.stat.ordersValue` | {open} / {cap} | {open} / {cap} |
| `sales.stat.demand` | Demand | Nachfrage |
| `sales.stat.income` | Income | Einnahmen |
| `sales.perMinute` | {amount}/min | {amount}/min |

`customersHint` is the cell's `title` tooltip, so the "townspeople" wording is not lost. The
cell's value shows `12 / 1000`. `sales.soldPerMinute` is reused for the sold table, and
`sales.perMinute` is used for demand and income.

- *Alternative: keep the sentences and use a two-column `dl`.* Rejected. The sentences have the
  number in the middle, so no column alignment is possible.

### 4. Sold list: a three-track grid

`dl` becomes `grid-template-columns: auto minmax(0, 1fr) minmax(9ch, max-content)`: the icon, the
name (it can shrink and ellipsise), and the value right-aligned. Every row is in the same grid,
so all columns line up and widths come from the widest content of each column. With the fixed
form, the widest value only changes when a magnitude boundary is crossed. `9ch` fits `999.9/min`
and `1.23K/min` in tabular digits, so even that crossing does not widen the column in practice.

### 5. Bulk offers: full-width buttons with a right-aligned value

Each `li` becomes a vertical stack: the button (`width: 100%`, `display: grid;
grid-template-columns: auto 1fr auto`: icon, resource name, value), then the `<small>` lot/cost
line under it. The button's width comes from the card, so price changes only move digits inside
the right-hand value cell. The sentence key `bulk.sell` (`{units} {resource} → {price}`) is
replaced by `bulk.sellValue` (`{units} → {price}`, same in DE), with the resource name in its own
cell. When the offer is not sellable, the value cell shows `–`, so the button keeps its height
and layout.

### 5a. Buyer cards on a shared row grid

The buyer cards are grid items of `.buyers`, but each card laid out its own rows, so a longer
flavour line or a wrapped cost line pushed MegaMeat's rows below the biogas plant's. Each card now
spans `1 + the most offers any buyer has` rows of `.buyers` with `grid-template-rows: subgrid`,
and its offer list does the same, so the header row and every offer row take the height of the
tallest cell in that row across all cards. Resources come in the same order for every buyer and
the biogas plant's extra products come last, so equal row indices mean equal resources. On a
phone the cards stack, and each still keeps its own rows.

- *Alternative: fixed heights for the header and each offer row.* Rejected: German text and the
  cost line wrap to different heights, and a fixed height would clip them or waste space.

### 6. i18n key test

The existing i18n dictionary test checks that EN and DE have the same keys. Removed keys are
deleted from both files in the same step, so the test keeps passing.

## Risks / Trade-offs

- [Nunito's `tnum` feature may be missing from the bundled subset] → Check in the browser with
  `1111` against `8888`. If the digits are not equal width, add `font-feature-settings: "tnum"`.
  If that also fails, use a width track in `ch` on the value cells, which is still layout-owned.
- [`37.0` reads slightly more technical than `37`] → Only on the live per-minute figures and
  bulk prices, where stability matters more. Static prices keep the short form.
- [German strings are longer, and a stat label could wrap to two lines and change the cell
  height] → Labels get `white-space: nowrap` with ellipsis, and the full text goes in the
  `title` tooltip.
- [Uncommitted `crossover-balancing` edits to `BulkBuyersPanel.svelte`] → Apply this change on
  top of them. It keeps the `.cost` span and `bulk.cost` key and only moves them onto the lot
  line.

## Migration Plan

No save or data migration. A pure UI change: roll back by reverting the commit.
