# Proposal

## Why

Since `sales-and-customers`, income is capped by demand: 10 customers take about one product
every 2 seconds, so any production beyond that piles up unsold until change 6 grows the customer
base. Players need an outlet for surplus that is clearly worse than selling vegan food to people.
Two bulk buyers give that outlet and set up a moral contrast the story can use later: MegaMeat
Corp buys the surplus as animal feed (a nod to the real fact that 77% of the world's soy goes to
animal feed, `docs/facts-research.md` S1), and a local biogas plant takes it for even less but
without feeding the industry.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is inserted after row 5
(`sales-and-customers`), whose demand cap it relieves, and before row 6 (`lebenshof-rescue`).

## What Changes

- **Two bulk buyers:** MegaMeat Corp (animal feed) and a biogas plant. Both buy raw ingredients
  (soybeans, wheat, oats) and intermediates (tofu, seitan, oat drink), in any amount and at any
  time. The biogas plant also takes unsold finished products; MegaMeat does not.
- **Low prices, in lots:** MegaMeat pays about 10% of what the ingredient is worth as vegan food,
  the biogas plant about 5%. To keep money whole, each buyer takes fixed lots with a whole-euro
  price (e.g. MegaMeat: 10 soybeans for €1; biogas plant: 20 soybeans for €1). All lot sizes and
  prices are content data.
- **Selling by hand:** one button per buyer and ingredient sells as many whole lots as are in
  stock; the rest stays. The button shows how many units go for how much. Earnings count towards
  money and total earnings (and so towards unlocks).
- **Flavour:** each buyer has a short satirical line in the panel (MegaMeat's thank-you, the biogas
  plant bubbling happily).
- **Tracking for later:** the game counts how many units went to each buyer, so later changes
  (villain events, acts, customer reactions) can refer to it. Nothing reacts to it yet.
- **Save format 4:** the two counters are saved; older saves start at 0.

## Capabilities

### New Capabilities

- `bulk-sales`: selling raw ingredients and intermediates to MegaMeat Corp and the biogas plant,
  and finished products to the biogas plant, in whole lots, the flavour lines, and the per-buyer counters.

### Modified Capabilities

None. Customer sales (`sales`) are unchanged; bulk sales are a separate outlet.

## Non-goals

- Any consequence of bulk sales beyond the price: MegaMeat growing stronger, counter-events, or
  the biogas plant influencing customers. The counters exist so a later change can add these.
- Automatic bulk selling or a feed contract; a candidate for `upgrades` (8).
- MegaMeat buying finished products, or price changes by amount sold.
- The news ticker version of the flavour lines: `aktionen-and-megameat` (7).
- Pacing: lot sizes and prices are starting values, tuned in `release-v1` (13).

## Impact

- New: `src/game/content/buyers.ts` (buyers, lots per resource, flavour keys),
  `src/game/systems/bulkSales.ts`, `src/ui/BulkBuyersPanel.svelte`, translations in DE and EN.
- Changed: `src/game/state.ts` (units sold per buyer), `src/game/save.ts` (format 4, migration
  3 → 4), `src/App.svelte` (panel placement).
- No change to production, customer sales or the tick.
- The in-progress change `manual-production-all-chains` also edits the translation files and
  `App.svelte`-adjacent UI; whichever lands second merges those files.
