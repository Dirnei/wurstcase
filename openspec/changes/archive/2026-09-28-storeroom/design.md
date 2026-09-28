# Design: storeroom

## Context

See proposal.md - Why. What we found in the code:

- `produce()` in `src/game/systems/production.ts` runs every building in chain order. For each it
  computes `ready = floor(progress)`, limits `units` by the input in stock, takes the input, adds
  `units × yieldPerRun` to the output, and on a shortfall records `state.waiting[building] =
  input` and caps progress at 1. `updateShortage()` turns `waiting` into the `shortage` hold of
  3 seconds. Nothing limits the output.
- `performManual()` / `manualUnits()` in `manual.ts` limit a click only by the input.
- Stock only leaves through production input, customer orders (`takeOrders`, `sell`) and bulk
  sales (`bulkSell`). None of these need to know about the cap: they only free room.
- `isOverstocked()` (products above 120 s of orders) drives the sales joke and the rail note
  `rail.overstock` ("Storeroom full – see Sales"). It is independent of any cap.
- Save format is 9. New fields follow the recipe at the top of `save.ts`: bump the format, add a
  migration with a default, read and validate in `readState()`, write in `writeState()`.
- The scripted player (`balance/player.ts`) sells surplus every 10 s, keeping 30 s of use, and
  logs purchases of kind `building | assistant | shelter | animal | upgrade`. `steady.ts` models
  flows per second and has no stock, so it does not need the cap.
- Stat art lives in `src/ui/art/stats/` and is registered in `STAT_ART` in `src/ui/art/index.ts`.
- The rail's stock section starts with an `h2` "Stock" and then the chain groups.

**src/game/ files and content entries:**
- New `src/game/content/storeroom.ts`: `STOREROOM = { baseRoom: 500, roomGrowth: 2, basePrice:
  100, priceGrowth: 3 }`.
- New `src/game/systems/storeroom.ts`: `storeroomRoom(state)`, `roomFor(state, resource)` (free
  room, never negative), `isFull(state, resource)`, `expansionPrice(state)`, `canExpand`,
  `expandStoreroom`.
- Changed: `state.ts` (`storeroom: number`, the level, starting at 1; `full` hold, not saved),
  `systems/production.ts`, `systems/manual.ts`, `save.ts`, `balance/player.ts`.

## Goals / Non-Goals

**Goals:**
- One rule for "how much fits", used by buildings and manual actions alike.
- The cap never destroys stock and never makes a building lose input.

**Non-Goals:**
- Per-resource room values or room effects from upgrades. `storeroomRoom` takes the state, so a
  later upgrade effect can multiply it without changing the callers.

## Decisions

### 1. The room as a level, stored as a plain number

`state.storeroom` is the level (1 in a new game), a plain number like building counts. Room is
`baseRoom × roomGrowth^(level − 1)` as a Decimal, so it stays exact far beyond 2^53. The price is
`ceil(basePrice × priceGrowth^(level − 1))`, mirroring `buildingPrice`.

- *Alternative: store expansions bought (starting at 0).* Rejected: the UI and the spec talk in
  levels, and storing the level avoids an off-by-one between them.

### 2. Output room limits runs in `produce()`, before input is taken

Per building: `fit = floor(roomFor(output) / yieldPerRun)` whole runs, and
`units = min(ready, inputLimit, fit)`. Input is taken only for `units`. When `units < ready`, the
building waits exactly as today (progress capped at 1). Because buildings run in chain order and
room is read fresh for each, a kitchen that uses tofu in the same tick frees room for the press
only in the next tick, which is at most one tick of delay and keeps the loop single-pass.

`waiting` keeps meaning "lacks input" (it feeds `shortage`). Full outputs go to a separate
`state.blocked: Partial<Record<BuildingId, ResourceId>>` (not saved), and a `full` hold is kept in
`updateFull()` beside `updateShortage()`: a resource is held full for 3 s after a building last
waited on it or after its stock was last at or above the room. The stock check matters because
a resource with no building (or after a manual fill) can be full without anything waiting.

- *Alternative: produce everything and clamp the stock afterwards.* Rejected: the building would
  use input for output that is thrown away, and "no loss" is a goal.
- *Alternative: reuse `waiting` with a reason field.* Rejected: `shortage` and the trend's
  "short stays steady" rule read it; mixing two meanings risks marking a full good as short.

### 3. Manual actions: `manualUnits` is also limited by room

`manualUnits = min(factor, inputLimit, floor(roomFor(output) / output.amount))`. With 0 room,
`canPerform` is false, so the button disables through the existing path.

### 4. Stock above the room is left alone

`roomFor` is `max(room − stock, 0)`, so an over-full stock simply yields 0 room. Nothing
subtracts stock. The save migration therefore needs no stock changes.

### 5. Save format 10

Migration 9 → 10 adds `storeroom: 1`. `readState()` accepts an integer ≥ 1 and rejects others as
invalid, like building counts. `full` and `blocked` are recomputed by the next tick and are not
written.

### 6. Rail: storeroom block replaces the "Stock" heading

The stock section starts with a small block: the storeroom art (`stat` kind, id `storeroom`),
"Storeroom · Level 3" as the section's `h2`, "2,000 per good" and an Expand button with the price
(`euros`). The button uses `.game-button` and is disabled when it cannot be afforded. On tablet
(names hidden) the room line hides and the button stays. On phones it is the first thing in the
stock drawer.

A full row gets class `full` and a small "FULL" / "VOLL" badge after the amount, with
`stock.full` as tooltip and visually hidden text, mirroring the short mark. On tablet the badge
shrinks to a single "■" mark with the same tooltip.

New keys (EN / DE):

| Key | EN | DE |
|---|---|---|
| `storeroom.title` | Storeroom | Lager |
| `storeroom.level` | Level {level} | Stufe {level} |
| `storeroom.room` | {amount} per good | {amount} pro Ware |
| `storeroom.expand` | Expand – {price} | Ausbauen – {price} |
| `stock.fullBadge` | full | voll |
| `stock.full` | Storeroom full: production of this good waits | Lager voll: Die Produktion dieser Ware wartet |
| `rail.overstock` (changed) | More than customers order – see Sales | Mehr als bestellt – siehe Verkauf |

`stock.title` stays for the phone drawer toggle.

### 7. Scripted player

In `playerStep`, after selling surplus and before choosing a target: if any resource is full and
`expansionPrice ≤ 300 s × current income` (the existing `CHEAP_UPGRADE_SECONDS`), expand and log
`{ kind: 'storeroom', id: 'storeroom', price }`. `Purchase.kind` gains `'storeroom'`. The dev page
lists it like other purchases; `SimulationResult.final` already carries the level.

- *Alternative: score the expansion by payback like buildings.* Rejected for now: its gain is the
  production it unblocks, which depends on what the surplus buyer pays and how long the good stays
  full. The cheap-enough rule is simple and deterministic; tuning can refine it.

## Risks / Trade-offs

- [The cap eats into bulk-buyer income, which the balance relies on for slow customer growth] →
  The scripted player sells surplus every 10 s, so at 500 room a good only fills when it makes
  more than ~50/s beyond use. Run the 60-minute default and MegaMeat simulations before and after,
  compare total earned and the pacing table, and tune `baseRoom` / `priceGrowth` until the pacing
  milestones stay in their windows. Record the final values in the storeroom spec.
- [An idle player sees buildings stop] → That is the point, and the full mark plus the Expand
  button in the same rail block tell them why and what to do.
- [The rail grows by two lines at 1280 × 720] → Check that the Sell button stays visible with all
  chains unlocked; if not, put level and room on one line.
- [`offline-progress` later] → The cap already bounds stock, so offline progress can reuse
  `tick()` unchanged.

## Migration Plan

Save format 9 → 10 adds `storeroom: 1`. Stocks are kept as saved, even above 500. Rolling back
the code would reject format-10 saves as too new, so a rollback needs players to restore the
backup slot; acceptable for a hobby project before release.
