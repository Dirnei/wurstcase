# Tasks

## 1. Share choice

- [x] 1.1 Add `src/ui/bulkShare.svelte.ts` holding the chosen share as module-level `$state`,
  starting at the last entry of `BULK_SHARES` (100 %); verify `npm run check` passes.
- [x] 1.2 Add the share control (radio group, arrow keys, 44 px targets, current choice marked)
  above the bulk table, with the `bulk.shareChoice` label in DE and EN; verify in the browser that
  the choice survives a switch to Produktion and back and resets to 100 % on reload.

## 2. Resource rows

- [x] 2.1 Rewrite `src/ui/BulkBuyersPanel.svelte` as one grid: a header row with each buyer's art,
  name and line; chain separator rows; one row per resource with art, name and stock (`liveCount`,
  tabular numbers). Keep today's row planning (shown, and taken by some buyer). Verify in the
  browser that the rows match today's offers, in chain and production order.
- [x] 2.2 Add `src/ui/BulkOfferCell.svelte`: price per unit (`unitPrice`), one sell button for the
  chosen share (units → price, dash when unavailable, existing aria labels), MegaMeat's reserved
  cost line, the flooded-market line in fixed slots, and the dash with `bulk.noProducts` as title
  and hidden text where a buyer takes nothing. Verify that selling from a cell changes stock and
  money exactly as before (compare one sale per buyer against the old panel's numbers).
- [x] 2.3 Mark the cell of `bestBuyer(state, resource)` when both buyers take the resource and
  their unit prices differ, with a visual accent and a `bulk.paysMore` label for screen readers;
  verify tofu and soybeans show the mark on the higher price and Tofu-Wurst shows none.
- [x] 2.4 Update `src/i18n/de.json` and `src/i18n/en.json` with the new keys (`bulk.shareChoice`,
  `bulk.perUnit`, `bulk.paysMore`, `bulk.stock`) and remove keys the panel no longer uses; verify
  the i18n dictionary test passes with `npm test` and no raw key shows in either language.

## 3. Phone layout and stability

- [x] 3.1 Below 768 px, stack each row (resource line, then the buyer cells side by side) and make
  the share control sticky at the top of the scrolling area (or directly above the rows if sticky
  cannot work there, per the design's risk note); verify at 375 and 320 px that nothing scrolls
  sideways, buttons are at least 44 px tall, and the control stays visible while scrolling to the
  wheat rows.
- [x] 3.2 Check stability: let stock and prices tick, switch the share, sell a resource to zero,
  and watch a flooded market recover; verify no row, button or line moves or changes size.

## 4. Verification

- [x] 4.1 Run `npm run check`, `npm test` and `npm run build`; all pass.
- [x] 4.2 Rebuild the container (`docker compose up -d --build web`) and play-check the Verkauf
  tab at 1280, 900, 375 and 320 px in DE and EN, light and dark theme: the scenarios of the
  `game-screen` and `bulk-sales` deltas hold, and the count of sell buttons is one per buyer and
  resource.
