# Design

## Context

`src/ui/BulkBuyersPanel.svelte` renders one card per buyer. The cards share a subgrid so the same
resource lines up, and every offer has three buttons (`BULK_SHARES` = 10 %, 50 %, 100 %) with
units, price and, for MegaMeat, the awareness and scandal cost. With every chain unlocked that is
up to 9 resources × 2 buyers × 3 buttons. The user playtested it and named three problems: too
much at once, hard to compare the buyers, and a lot of scrolling to sell.

Everything a row needs already exists in `src/game/systems/bulkSales.ts`: `hasLot`, `lotFor`,
`canBulkSell`, `bulkSaleUnits`, `bulkSaleValue`, `bulkSaleCost`, `unitPrice`, `bestBuyer`,
`isFlooded`, `marketLevel`, `timeToRecover` and `bulkSell`.

## Goals / Non-Goals

**Goals:**
- Answer "where do I sell this, and how much?" in one row.
- At most one sell button per buyer and resource; one shared share choice.
- No layout movement while values tick (the Sales tab's stability rule stays).
- Works at 1280, 900, 375 and 320 px, in DE and EN.

**Non-Goals:**
- Balance or game-logic changes; hiding empty resources; saving the share choice.

## Decisions

### 1. Resource rows, one column per buyer
One CSS grid for the whole table: columns `resource | buyer cell × number of buyers`. The first
row is the header: an empty resource cell, then per buyer its `ArtSlot` (kind `buyer`), name and
italic line. Then, per chain, a separator row spanning all columns with the chain name
(reusing the current `.chain h4` style), and one row per resource. The row planning stays exactly
as today (`CHAIN_RESOURCES` × `isResourceShown` × "some buyer has a lot"), so the set of rows is
unchanged; only the direction of the layout flips. The buyer columns come from `BUYERS`, so a
third buyer would get a column without code changes.

*Alternatives considered with the user:* a resource picker with one detail box (two taps per sale)
and slimmer buyer cards (comparison still across two cards). The user chose rows.

### 2. Cell content
Per buyer that takes the resource:
- price per unit now (`unitPrice`, fixed-decimal euros) with a "pays more" mark;
- one `game-button` for the chosen share: `liveCount(units) → liveEuros(value)`, or a dash when
  `canBulkSell` is false; the existing `bulk.sellShare` / `bulk.sellShareNone` aria labels stay;
- MegaMeat only: the reserved cost line (awareness and scandal percent, as today);
- flooded markets only: the market line (level %, 4 px meter, time to 95 %) in fixed-width slots,
  as today, shrunk to fit a cell.

A buyer that does not take the resource gets a dash. MegaMeat's dash on a product carries
`bulk.noProducts` as `title` and as visually hidden text.

The resource cell shows `ArtSlot` (kind `resource`), the name and the stock (`liveCount`), with
tabular numbers so the stock ticking never resizes the column.

### 3. "Pays more" uses the existing `bestBuyer`
The mark goes to `bestBuyer(state, resource)?.buyer` when both buyers take the resource and their
`unitPrice` differs. It compares the current price per unit, which is the same figure the cell
shows, so the mark always agrees with what the player reads. For a large dump on a flooded market
the other buyer can end up paying more for the whole sale; the button's total shows that, and the
mark stays simple. No new game function is needed. The mark is a subtle accent (border or
background tint from the existing tokens) plus a small "pays more" label for screen readers, never
colour alone.

### 4. Share choice in the UI only
A small segmented control above the table, built as a radio group (`role="radiogroup"`, arrow
keys move, 44 px tall targets), labelled from `BULK_SHARES`. Its value lives in a module-level
`$state` in a tiny `src/ui/bulkShare.svelte.ts`, so it survives tab switches but not a reload, and
it starts at the last entry of `BULK_SHARES` (100 %). It is not part of `GameState`.

### 5. Phone layout (< 768 px)
Each resource row becomes a block: the resource line on top, the buyer cells side by side below
(`grid-template-columns: repeat(buyers, minmax(0, 1fr))`). The header keeps the two buyer
columns, so the buyer names still sit above their cells. The share control is `position: sticky`
at the top of the panel's scroll container. Buttons keep `min-height: 44px`. The MegaMeat cost line
keeps its reserved two-line height on phones, as today.

### 6. Stability
Fixed-width slots for every ticking figure (tabular numbers, reserved cost and market lines, dash
placeholders of button size), as the current panel does. Switching the share only changes digits.

### Files
- Rewritten: `src/ui/BulkBuyersPanel.svelte` (panel, header, share control, rows).
- Added: `src/ui/BulkOfferCell.svelte` (one buyer cell: price, mark, button, cost line, market
  line) to keep the panel file small; `src/ui/bulkShare.svelte.ts` (share state).
- Changed: `src/i18n/de.json`, `src/i18n/en.json`: new `bulk.shareChoice` (control label),
  `bulk.perUnit` ("{price}/unit" / "{price}/Stück"), `bulk.paysMore`, `bulk.stock`; `bulk.share`,
  `bulk.lot` and `bulk.lotSize` are dropped if the new cell no longer uses them.
- No `src/game/` files and no content entries change.

## Risks / Trade-offs

- [The mark points at MegaMeat for raw goods, nudging players to feed it] → its cost line sits
  directly under the button in the same cell, and the mark reads "pays more", not "best".
- [Sticky control inside the tab layout] → depends on which element scrolls on phones; verify at
  375 and 320 px and fall back to placing the control directly above the rows if sticky cannot
  work there.
- [Narrow cells at 320 px with the MegaMeat cost line and a market line] → reuse the reserved
  two-line cost slot and abbreviate the market line to level and time; checked in the browser
  pass.
- [Losing the 10/50/100 overview in one glance] → accepted: the user prioritised fewer buttons and
  less scrolling.

## Migration Plan

UI only; ships with a normal build. No save migration. Rollback is a revert.

## Open Questions

None.

## Implementation Notes

Intent-preserving deviations made while applying (ui-worker):

- **Market line shortened in every width**, not only at 320 px: the cell shows the level percent,
  the meter and the recovery time (`52 % ▬▬ 1:22`); the full `bulk.market` / `bulk.recover` text is
  the line's tooltip and its screen-reader text.
- **Price per unit with two decimals** (`€0.42/unit`), rounded down like every figure; the
  one-decimal fixed form would show many per-unit prices as `€0.4`.
- **"Pays more" mark:** leaf-tinted cell with a solid leaf border and a `▲` in a reserved slot,
  plus `bulk.paysMore` as hidden text.
- **Phone header:** the buyer illustrations are hidden below 768 px to save height; name and line
  stay above each column.
- **Share label:** `bulk.shareChoice` reads "Sell per click" / "Pro Klick verkaufen".
- **Task 4.2:** the play-check ran against a Vite dev server in the worktree; the container is
  rebuilt when the branch is merged into main, per the team flow.
