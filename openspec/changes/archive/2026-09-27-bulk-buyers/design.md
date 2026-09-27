# Design

## Context

See proposal.md (Why) and the spec. After `sales-and-customers`, money and stock are whole
Decimals, customer sales go through `src/game/systems/sales.ts`, and the save is at format 3.
`isResourceShown()` in `src/game/systems/buildings.ts` decides which resources the stock panel
lists. Player actions reach the state through `act()` in `src/ui/game.svelte.ts`. The in-progress
change `manual-production-all-chains` touches `manual.ts`, `ManualActions.svelte` and the
translation files, but not state, save or sales.

## Goals / Non-Goals

**Goals:**
- Buyers and their lots are pure content, so a later act can add a buyer (or change prices) with
  data only.
- Money stays whole without rounding: prices are per whole lot.
- The per-buyer counters are plain state that later changes read; bulk sales never read them.

**Non-Goals:**
- Any effect of the counters (see proposal Non-goals).
- Running bulk sales in `tick()`: they are player actions only, so determinism is unaffected.

## Decisions

### Files

```
src/game/content/buyers.ts        BUYERS: MegaMeat and biogas plant, each with a lot per resource
src/game/systems/bulkSales.ts     lotsAvailable, bulkSaleUnits, bulkSaleValue, canBulkSell, bulkSell
src/game/state.ts                 + unitsSold: Record<BuyerId, Decimal>
src/game/save.ts                  format 4, migration 3 → 4
src/ui/BulkBuyersPanel.svelte     one block per buyer: name, flavour line, a sell button per resource
```

### Content: lots derived from vegan value (starting values)

Each ingredient's vegan value is what it earns once turned into its chain's product and sold to a
customer: soybean €1 (3 → 1 tofu → €3 Tofu-Wurst), tofu €3, wheat €6.25, seitan €12.50, oats €6,
oat drink €12. MegaMeat pays about 10% of that, the biogas plant about 5%, rounded to lots with
whole-euro prices:

| Resource | MegaMeat lot | per unit | Biogas lot | per unit |
|---|---|---|---|---|
| Soybeans | 10 for €1 | €0.10 | 20 for €1 | €0.05 |
| Wheat | 8 for €5 | €0.625 | 16 for €5 | €0.3125 |
| Oats | 5 for €3 | €0.60 | 10 for €3 | €0.30 |
| Tofu | 10 for €3 | €0.30 | 20 for €3 | €0.15 |
| Seitan | 4 for €5 | €1.25 | 8 for €5 | €0.625 |
| Oat drink | 5 for €6 | €1.20 | 10 for €6 | €0.60 |
| Tofu-Wurst | – | – | 20 for €3 | €0.15 |
| Leverkas | – | – | 4 for €5 | €1.25 |
| Hafer-Cappuccino | – | – | 5 for €3 | €0.60 |

Only the biogas plant takes finished products (unsold stock that would otherwise spoil), at about
5% of the customer price. MegaMeat has no lots for products.

```ts
type BuyerId = 'megaMeat' | 'biogas'
interface BuyerDef { id: BuyerId; lots: Partial<Record<ResourceId, { units: number; price: number }>> }
```

The content test checks the spec's invariants rather than the numbers: MegaMeat has lots only for
raw ingredients and intermediates, the biogas plant for every resource, every price is a whole
number, biogas pays less per unit than MegaMeat wherever both buy,
and both pay less per unit than the vegan value computed from the building ratios and product
prices. The vegan value is computed in the test from content, so a price retune that breaks the
"worth less than vegan food" rule fails the test.

Alternative: a price per unit with the payout rounded down. Rejected because small sales (5
soybeans to the biogas plant) would pay €0 and silently destroy stock.

### Selling

`bulkSell(state, buyer, resource)`: `lots = floor(stock / units)`; if 0, nothing happens. Otherwise
stock −= lots × units, money and totalEarned += lots × price, `unitsSold[buyer]` += lots × units.
`bulkSaleUnits` and `bulkSaleValue` compute the same numbers without changing state for the
button label ("30 Sojabohnen → 3 €"). The panel lists, per buyer, every resource that has a lot
and passes `isResourceShown()`.

### Panel and flavour

`BulkBuyersPanel.svelte` sits after the stock panel, as a secondary outlet below the main flow.
Keys: `bulk.title`, `bulk.megaMeat.name`, `bulk.megaMeat.line` ("MegaMeat Corp dankt für Ihren
Beitrag zur modernen Tierhaltung." / "MegaMeat Corp thanks you for supporting modern livestock
farming."), `bulk.biogas.name`, `bulk.biogas.line` ("Die Biogasanlage blubbert zufrieden." /
"The biogas plant bubbles contentedly."), `bulk.sell` ("{units} {resource} → {price}"),
`bulk.hint` (a one-line explanation that customers pay much more).

### Save format 4

Bump `CURRENT_FORMAT` to 4. Migration 3 → 4 adds `unitsSold: { megaMeat: "0", biogas: "0" }`.
`readState` validates each known buyer's count as a whole amount and ignores unknown buyer keys,
like resources.

## Risks / Trade-offs

- [Bulk sales let players reach unlocks without customers, which weakens the demand bottleneck
  that change 6 relies on] → The prices are 10% / 5% of vegan value, so bulk selling is a slow
  trickle next to customer sales; the spec requires it to stay below vegan value. Tuning (13)
  checks the pacing.
- [Selling an intermediate can starve the next building] → Intended player choice; the existing
  red shortage mark shows it.
- [Both changes in flight edit `de.json` / `en.json`] → Keys don't overlap; the second change to
  land resolves the textual merge.

## Migration Plan

Format 3 saves load through migration 3 → 4 with both counts at 0; older formats pass through all
earlier migrations first.
