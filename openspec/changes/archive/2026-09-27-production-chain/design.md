# Design

## Context

See proposal.md (Why) and the specs. `GameState` holds only `playTime` today, `tick()` only
advances it, and the save codec (`src/game/save.ts`) is at format 1 with an empty `MIGRATIONS`
table and a comment describing how to add a field. The UI reads state through `readGame()` and
refreshes on a `version` counter that `advance()` bumps. There is no path yet for player actions
to change state. `src/game/content/` and `src/game/systems/` do not exist yet. This change
creates the layout from concept section 7.2.

## Goals / Non-Goals

**Goals:**
- One generic building model (inputs → output at a rate) that covers fields, processing and
  kitchens, so later chains and acts are content entries only.
- Stock and money are always whole numbers; production is discrete.
- One big tick and many small ticks agree up to one unit per building type (the relaxed
  determinism requirement in the game-loop delta).
- Actions (buy, manual, sell) are pure functions on `GameState` and are tested without Svelte.

**Non-Goals:**
- Output multipliers. Upgrades (8) will add them by wrapping the rate lookup. Nothing here
  prepares for that beyond keeping rates in one function.
- Showing locked buildings as teasers or a "next unlock" hint.

## Decisions

### Files

```
src/game/content/resources.ts   ResourceId union, kind (raw | intermediate | product), display order
src/game/content/crops.ts       3 fields: output resource, rate, base price, unlock threshold
src/game/content/processors.ts  3 processors: input, ratio, output, max rate, base price, unlock
src/game/content/products.ts    3 kitchens (same shape as processors) + product base prices
src/game/content/manual.ts      3 manual actions for the soy chain (inputs → output per click)
src/game/content/buildings.ts   BUILDINGS: fields, processors and kitchens in chain order, typed by BuildingId
src/game/systems/production.ts  produce(state, seconds): runs all buildings in chain order, in whole units
src/game/systems/buildings.ts   buildingPrice, canBuy, buyBuilding, isUnlocked
src/game/systems/manual.ts      canPerform, performManual
src/game/systems/sales.ts       canSellAll, sellAll (temporary; replaced by sales-and-customers)
src/game/state.ts               + money, totalEarned, stock, buildings, progress, waiting, shortage
src/game/tick.ts                calls produce() after advancing playTime
src/game/save.ts                format 2, migration 1 → 2, Decimal fields as strings
```

Each system file gets a colocated `*.test.ts`.

### Content entries (starting values, tuned in play)

| Building | Makes | Input (ratio) | Rate / s | Base price | Unlocks at earned |
|---|---|---|---|---|---|
| Soybean field | soybeans | – | 1 | €10 | start |
| Tofu press | tofu | 3 soybeans | 0.5 | €25 | start |
| Tofu-Wurst kitchen | Tofu-Wurst | 1 tofu | 0.5 | €40 | start |
| Wheat field | wheat | – | 1 | €150 | €200 |
| Seitan kitchen | seitan | 2 wheat | 0.5 | €400 | €200 |
| Leverkas oven | Leverkas | 2 seitan | 0.25 | €1,000 | €1,500 |
| Oat field | oats | – | 2 | €2,500 | €5,000 |
| Oat mill | oat drink | 2 oats | 1 | €6,000 | €5,000 |
| Café bar | Hafer-Cappuccino | 1 oat drink | 0.5 | €12,000 | €5,000 |

Product base prices: Tofu-Wurst €3, Hafer-Cappuccino €12, Leverkas €25 (highest, per concept
3.2). Manual actions: harvest +1 soybean; press 3 soybeans → 1 tofu; make 1 tofu → 1 Tofu-Wurst.
Cost growth factor 1.15 is one constant in `buildings.ts`. Prices are rounded up to whole euros
(`ceil`), so money stays whole: every income is a whole number of whole-euro products.

### State shape

```ts
interface GameState {
  playTime: number
  money: Decimal
  totalEarned: Decimal                    // lifetime earnings in this game; drives unlocks
  stock: Record<ResourceId, Decimal>
  buildings: Record<BuildingId, number>   // counts are plain numbers (config rule)
  progress: Record<BuildingId, number>    // units in progress per building type, 0 ≤ p ≤ 1 when waiting
  waiting: Partial<Record<BuildingId, ResourceId>>  // derived each tick; not saved
  shortage: Partial<Record<ResourceId, number>>     // seconds left to show a resource as short; not saved
}
```

`progress` is a plain number: it holds only the fraction towards the next few units, never an
amount of stock, so it cannot outgrow a double. It is saved, so a slow Leverkas oven does not
lose its half-baked Leverkas on reload.

`waiting` lives in state so the UI can read it through `readGame()`. It is recomputed on every
tick, so it is left out of the save and starts empty on load. Alternative: recompute the stall
status in the UI from stock levels. Rejected because a stalled building has near-zero input
stock, which looks the same as a building that just consumed a full tick's worth. Only
production knows whether it was limited.

A building counts as waiting when, in the last tick, it had at least one unit ready that it
could not complete for lack of input.

The UI does not show `waiting` directly: a press fed just too slowly flips between waiting and
pressing every few seconds, and a per-building message flickered. Instead, `produce()` keeps a
`shortage` hold timer per input resource: set to 3 s (`SHORTAGE_HOLD_SECONDS`) in every tick a
building waits for it, counted down by the tick's seconds otherwise, and removed at 0. The stock
panel shows a resource red while it has a shortage entry. Keeping the timer in the tick instead
of a UI timeout makes it testable, follows game speed (the debug panel's ×10), and needs no
cleanup. It is not saved; a reload shows red again within one tick if the shortage persists.
Alternative: a debounce in the Svelte component with `setTimeout`. Rejected because it would be
the only wall-clock logic in the UI and could not be unit-tested with the rest of production.

### Production order and determinism

`produce()` runs buildings in chain order: all fields, then all processors, then all kitchens.
Output from an earlier stage in the same tick is available to later stages. For each building
type with at least one copy:

1. `progress += count × rate × seconds`
2. `ready = floor(progress)`; for buildings with input, `units = min(ready, floor(stock[input] / ratio))`
3. input −= units × ratio, output += units, `progress −= units`
4. if `units < ready` (input was short): the building is waiting, and `progress = min(progress, 1)`
   so it keeps exactly one unit ready but banks nothing more.

All arithmetic on stock is on whole numbers, so stock stays whole. The cap in step 4 is what the
"No banked progress" scenario asks for: a starved press does not produce a burst when supply
returns.

With upstream-first ordering, one big step and many small steps agree except at unit boundaries:
a unit that completes exactly at the end of the period (or a hair after, through float
accumulation of `0.1 × 600`) may be counted in one and not the other. That is the ±1 unit per
building type the game-loop delta allows. A test runs a stalled chain 60 s in one tick vs
600 × 0.1 s and checks every stock within ±1 per building in the chain and play time within
1e-9. Alternative: continuous amounts with whole numbers only on display. Rejected by the player
experience goal: the stock should never hold a fraction that the UI hides.

### Unlocks by lifetime earnings

`isUnlocked(building, state)` is `state.totalEarned >= threshold`. Earnings only grow, so an
unlock never reverts, and no unlocked-list is needed in the save. Prestige (10) resets
`totalEarned` together with the buildings, which is the intended re-lock on Neustart.
Alternative: unlock by owning N of the previous building. Rejected because it pushes players to
over-buy early buildings instead of following the money.

A resource is shown once the player has any stock of it or a building that makes it is unlocked.

### Player actions in the UI

`game.svelte.ts` gets `act(fn: (state) => void)`: it runs a system action on the live state and
bumps `version`. Components call e.g. `act((s) => buyBuilding(s, 'tofuPress'))`. Disabled states
use the pure `canBuy` / `canPerform` / `canSellAll` through `readGame()`, so the UI holds no
game rules.

New components: `Money.svelte` (money line), `StockPanel.svelte` (stock by kind),
`ManualActions.svelte`, `ChainPanel.svelte` (one per chain) with `BuildingRow.svelte` (name,
count, per-second output, price, buy button, progress bar) and `SellButton.svelte`. The stock
panel colours short resources red and adds a translated "short" hint for screen readers. Money uses a
translated template (`"money": "{amount} €"` in DE, `"€{amount}"` in EN) around `formatNumber`.

### Save format 2

Bump `CURRENT_FORMAT` to 2. Migration 1 → 2 adds `money: "0"`, `totalEarned: "0"`, zero stock and
zero counts. `writeState` writes Decimals with `toString()` and omits `waiting` and `shortage`. `readState`
validates every known resource and building. It rejects non-numeric strings, negative, NaN or
fractional amounts, negative or non-integer counts, and negative or non-finite progress. It ignores unknown keys, so a later content removal
does not brick a save.

## Risks / Trade-offs

- [Pacing numbers are guesses] → All values live in content files. The dev debug panel (12)
  and the tuning pass (13) are where they get fixed. The spec scenarios use the table's values,
  so tests fix them for now and get updated when tuned.
- [Temporary sell button teaches players a habit that disappears in change 5] → It is labelled
  plainly ("Alles verkaufen" / "Sell everything"), and change 5 lands right after.
- [Decimal objects in state plus `Object.assign` in `replaceState`] → Imported states are built
  by `readState`, so they contain fresh Decimals. Nothing shares references with the old state.
- [Progress bars on fast buildings would flicker, since they complete several units per tick]
  → The bar shows full when a building type makes more than 10 units per second (more than one
  per tick).
- [Format 2 saves written during development of this change, before whole units, have fractional
  stock and no `progress`] → Format 2 has not shipped, so it is changed in place rather than
  bumped. Such local test saves are reported as unreadable and kept aside by the existing
  save-system recovery.

## Migration Plan

Format 1 saves load through migration 1 → 2 with a fresh economy and their play time. A format 2
save opened by the previous release is refused as "too new" and left untouched, which the
save-system spec already guarantees.
