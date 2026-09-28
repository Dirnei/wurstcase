# Tasks

## 1. Fixed-decimal number form

- [x] 1.1 Add tests to `src/format/number.test.ts` for every scenario in the "Fixed-decimal form for live figures" requirement: `37.0`, `37.5`, `0,0`, `1.20K`, `1.00K`, `12,0 Mio.`, `250K`, `1.50e15`, `-2.5`, and regular `37` unchanged. Run `npm test` and verify that they fail.
- [x] 1.2 Add the `{ fixed: true }` option to `formatNumber` in `src/format/number.ts` (keep trailing zeros in `truncate()`, and use 2 decimals in the scientific range). Verify that all formatter tests pass, old and new.
- [x] 1.3 Add `liveAmount` and `liveEuros` to `src/ui/amounts.ts`, next to `amount` and `euros`. Verify with `npm run check`.

## 2. Sales figures and sold table

- [x] 2.1 Replace `sales.customers`, `sales.orders`, `sales.demand` and `sales.income` with the `sales.stat.*` and `sales.perMinute` keys from design.md, in both `en.json` and `de.json`. Verify with `src/i18n/dictionaries.test.ts`.
- [x] 2.2 Rebuild the figures in `SalesPanel.svelte` as a stat grid (label above, right-aligned tabular value; customers hint as `title`). Use `liveAmount`/`liveEuros` for demand and income. Verify with `npm run check`.
- [x] 2.3 Turn the sold `dl` into the three-track grid (icon, name, `minmax(9ch, max-content)` value right-aligned), and show sold per minute with `liveAmount`. Verify with `npm run check`.

## 3. Bulk offers

- [x] 3.1 Replace `bulk.sell` with `bulk.sellValue` (`{units} → {price}`) in both dictionaries. Verify with the dictionary test.
- [x] 3.2 Rebuild each offer in `BulkBuyersPanel.svelte` as a full-width grid button (icon, resource name, right-aligned value showing `–` when not sellable), with the lot and `bulk.cost` line below it. Keep the `crossover-balancing` cost span. Use `liveAmount`/`liveEuros` for units and price. Verify with `npm run check`.

- [x] 3.3 Put the buyer cards on a shared row grid (`subgrid` for the card and its offer list, spanning 1 + the most offers). Verify in the browser that MegaMeat's and the biogas plant's soybean and tofu rows start at the same height at 1280 px, in EN and DE.

## 4. Verification

- [x] 4.1 Run `npm test` and `npm run build`. Both must pass.
- [x] 4.2 Play-check in the browser (leave the container running), in EN and DE, at 1280 × 720 and 375 × 667. Let income and the sold amounts cycle through whole and fractional values, and let a soybean stock grow past a MegaMeat lot boundary. Confirm that nothing on the Verkauf tab moves or re-wraps, that digits are equal width (compare `1111` with `8888`; if they differ, add `font-feature-settings: "tnum"`), and that nothing scrolls horizontally at 375 px.
- [x] 4.3 Run `openspec validate stable-sales-layout --strict`. It must pass.
