# Proposal: bulk-sell-shares

## Why

A bulk sale always takes every whole lot in stock. The player cannot sell just some surplus and
keep the rest for the next production step or for customers, and with MegaMeat, whose every sale
costs customers and awareness, it is all or nothing. Three fixed shares per resource (10%, 50%,
100%) let the player dose a sale without typing amounts.

The concept doc did not plan this change in its section 8 sequence. It is a control change to
`bulk-buyers` and the bulk offer layout from `stable-sales-layout`, written on top of
`megameat-outbids` (MegaMeat lots of 20).

## What Changes

- Each bulk offer (one resource at one buyer) gets three sell buttons: **10%**, **50%** and
  **100%** of the current stock of that resource.
- Each button sells the largest number of whole lots that fits in its share of the stock
  (rounded down), and shows what it takes and pays. A share smaller than one lot is unavailable.
- For MegaMeat, each button shows what its own sale would cost in customers and awareness.
- The offer row becomes: resource (art and name) with the lot size on one line, then the three
  buttons side by side in equal columns. Values keep the fixed-decimal form and fixed widths, so
  nothing moves while stock ticks.
- The balancing page's scripted player is unchanged (it keeps selling exactly its surplus).

## Non-goals

- Free amounts (slider or input field), or other shares.
- Remembering a preferred share, or a global share toggle for all offers.
- Changing prices, lot sizes or feed costs (`megameat-outbids`).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `bulk-sales`: Selling in bulk offers three shares per offer; Price of feeding MegaMeat shows
  the cost per button.
- `game-screen`: the Sales tab's bulk offer layout (three buttons per offer, fixed widths).

## Impact

- `src/game/systems/bulkSales.ts`: a `share` parameter on `bulkSaleUnits`, `bulkSaleValue`,
  `bulkSaleCost`, `canBulkSell` and `bulkSell` (default 1, so existing callers keep their
  behaviour); `BULK_SHARES = [0.1, 0.5, 1]` in content.
- `src/ui/BulkBuyersPanel.svelte`: new offer row with three buttons.
- `src/i18n/en.json`, `de.json`: share labels and the per-button aria text.
- Tests: `bulkSales.test.ts`.
- Implement after `megameat-outbids` is archived: its deltas rewrite the same bulk-sales
  requirements and this change is written against them.
