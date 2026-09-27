# Proposal

## Why

The game can now keep progress, but there is nothing to progress in yet. The production chain
(fields → processing → products) is the business half of the core loop. Sales, rescue and
awareness all build on it. This is row 4, `production-chain`, in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` (concept sections 3.1, 3.2 and the
first rows of section 5).

## What Changes

- **Money and resources:** the game tracks euros plus the stock of every raw ingredient
  (soybeans, wheat, oats), intermediate (tofu, seitan, oat drink) and product (Tofu-Wurst,
  Leverkas, Hafer-Cappuccino). All amounts are big numbers.
- **Manual start:** buttons to harvest soybeans, press tofu and make Tofu-Wurst by hand, so a new
  game can get going with no buildings.
- **Buildings in three chains:** each chain has a field, a processing building and a product
  kitchen. Fields produce raw ingredients per second. Processing buildings and kitchens convert
  inputs into outputs at a fixed ratio. Everything is produced and consumed in whole units: a
  building type works towards its next unit (shown as a progress bar) and then adds it in one go.
- **Stalls:** a building whose next unit lacks input waits, and the stock it lacks turns red. The
  red stays until the shortage has been over for a few seconds, so it does not flicker.
- **Cost scaling:** every building's price rises by 15% per copy owned, rounded up to whole
  euros.
- **Unlocks:** the soy chain is available from the start. The wheat chain, Leverkas and the oat
  chain unlock when the player's total earnings reach set thresholds. All thresholds, prices,
  rates and ratios are content data.
- **Temporary selling:** a "sell everything" button sells all product stock at each product's
  base price, so money can be earned before demand exists. `sales-and-customers` (5) replaces it
  with demand-based selling.
- **Save format 2:** the new state is saved and restored. Format 1 saves are migrated to a fresh
  economy that keeps their play time.

## Capabilities

### New Capabilities

- `production-chain`: resources, manual actions, buildings and their purchase, cost scaling,
  production with input ratios and stalls, and unlocks.
- `sales`: turning product stock into money. For now this is the temporary "sell everything at
  base price" action.

### Modified Capabilities

- `game-loop`: the determinism requirement allows a difference of at most one unit per building
  type between one big tick and many small ones, because production happens in whole units.

The save-system requirements already cover saving the complete state and migrating older formats;
this change only adds fields and a migration, so that spec is unchanged.

## Non-goals

- Demand, customers, the min(stock, demand) rule, most-expensive-first selling and the
  overproduction joke: `sales-and-customers` (5).
- Hired farmers and other output multipliers, e.g. "Better seeds": `upgrades` (8). The concept
  lists farmers under fields, but they are modelled as upgrades there.
- News ticker tutorial hints for the next step: `aktionen-and-megameat` (7).
- Buying several buildings at once (×10, max) and selling buildings.
- Offline production while the game is closed: `offline-progress` (11).
- Final pacing numbers: all values in this change are starting values, tuned in `release-v1` (13).

## Impact

- New: `src/game/content/` (resources, fields, processors, products, manual actions),
  `src/game/systems/` (production, buildings, manual, sales), new Svelte panels for money,
  stock, manual actions and buildings, and new translation keys in DE and EN.
- Changed: `src/game/state.ts` (money, lifetime earnings, stock, building counts),
  `src/game/tick.ts` (runs production), `src/game/save.ts` (format 2, migration 1 → 2, amounts
  saved as strings), `src/ui/game.svelte.ts` (player actions that refresh the UI),
  `src/App.svelte` (layout).
- No new dependencies. `break_eternity.js` is already installed.
