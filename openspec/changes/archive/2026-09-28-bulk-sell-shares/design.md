# Design: bulk-sell-shares

## Context

See proposal.md - Why. What we found in the code:

- `systems/bulkSales.ts`: `wholeLots(state, buyer, resource)` = `floor(stock ÷ lot units)`;
  `bulkSaleUnits`, `bulkSaleValue`, `bulkSaleCost`, `canBulkSell` and `bulkSell` all build on it.
  After `megameat-outbids`, MegaMeat's lot comes from `lotFor(state, …)`.
- `BulkBuyersPanel.svelte`: each offer is one `li` with a full-width `.offer` button (grid: art,
  name, value) and a `<small>` line with the lot and MegaMeat's cost. Buyer cards share rows via
  `subgrid`, so the same resource lines up across both cards.
- `balance/player.ts` sells surplus by setting aside the stock it keeps and calling `bulkSell`
  on the rest; it needs no shares.
- `liveCount` (whole-count form, from `manual-feedback`) and `liveEuros` exist in `amounts.ts`.

**src/game/ files and content entries:**
- `content/buyers.ts`: `BULK_SHARES = [0.1, 0.5, 1] as const`.
- `systems/bulkSales.ts`: optional `share = 1` on the five functions above.

## Goals / Non-Goals

**Goals:**
- One rule for "how much does this button sell", used by the button text, the cost preview and
  the sale itself.

**Non-Goals:**
- Changing how the scripted player sells.

## Decisions

### 1. Share applied before rounding to lots

`wholeLots(state, buyer, resource, share) = floor(floor(stock × share) ÷ lot units)`. Rounding the
share to whole units first keeps Decimal math exact for huge stocks, and rounding down to lots
means a share never sells more than it says. `share` defaults to 1, so every existing call and
test keeps today's behaviour.

- *Alternative: round the share up to a whole lot.* Rejected: "10%" would then sometimes sell
  far more than a tenth of a small stock.

### 2. Offer row: header line plus a three-column button row

Each `li` becomes: a header line with the resource art, name and the lot (MegaMeat: "in Posten zu
20" only, since its price depends on the flood; biogas: "je 7 für 3 €"), for MegaMeat the market
line from `megameat-outbids` unchanged (Markt %, meter, "95 % in m:ss" in reserved slots), then a
`grid-template-columns: repeat(3, minmax(0, 1fr))` row of three `.game-button` elements. Each button
stacks: the share ("10 %", bold), the units ("40 →", `liveCount`) and the price ("121,0 €",
`liveEuros`) on lines of their own, so a growing value never re-wraps, and for MegaMeat a reserved
cost line ("−26" with the customers illustration and "−13" with the awareness illustration, 14 px,
danger colour, empty but present when 0). The feed cost therefore moves off the offer's lot line
into each button, since it differs per share. Each share's price is `floodedValue` for its units at
the current flood, as if it were the only sale, so the 10% button shows a better average per unit
than 100%. Unavailable buttons show "–" and are disabled. The subgrid rows between the two buyer
cards stay.

On phones a cost line with thousands ("−990 −512" plus icons) is wider than a button (about 90 px),
so the amount-and-icon pairs wrap as a whole into a second line that phones always reserve; the
button's height stays the same whatever the values.

- *Alternative: a share toggle above each card plus one sell button per offer.* Rejected: the user
  asked for three buttons per product, and a toggle hides what each share would pay.

### 3. Accessible names

Each button's `aria-label` spells out the whole sale: "Sell 10 % of Soybeans to MegaMeat Corp
(animal feed): 40 for €121, costs 26 customers and 13 awareness" (new keys `bulk.sellShare` and
`bulk.sellShareNone` for an unavailable share). The visible text stays
short.

## Risks / Trade-offs

- [The Verkauf tab gets much taller: 3-line buttons for up to 9 biogas offers] → The tab's content
  area already scrolls on its own; the figures and the sold table stay at the top. Check at
  1280 × 720 that the sales figures remain visible without scrolling.
- [Rapid clicks on 10% sell many small lots, each paying MegaMeat's minimum 1-customer cost] →
  That is the existing rule per sale (costs round up); smaller sales cost relatively more, which
  fits the "dosing is not free" idea. Accepted.
- [Depends on `megameat-outbids`] → Its lot of 20 and the rewritten requirements are the base of
  this change's deltas; implement after it is archived.

## Migration Plan

No data migration. Roll back by reverting the commit.
