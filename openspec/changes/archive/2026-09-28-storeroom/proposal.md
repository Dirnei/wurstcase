# Proposal: storeroom

## Why

Stock has no upper limit. The rail says "Storeroom full" once products exceed two minutes of
orders, but production carries on and the numbers keep growing forever. That message promises a
limit that does not exist, and unbounded stock takes away a decision: nothing makes the player
think about where the surplus goes. A real storeroom with a cap per good, which the player can
expand again and again, gives the surplus a consequence (full goods stall their buildings) and
gives the game another thing to upgrade.

The concept doc did not plan this change in its section 8 sequence. It builds on the production
stalls from `production-chain`, the stock rail from `ui-shell-tabs` / `stock-by-chain` and the
surplus selling from `bulk-buyers` / `crossover-balancing`. It also prepares for
`offline-progress` (row 11), where a cap keeps a long absence from piling up endless stock.

## What Changes

- **Storeroom with levels**: the game gets a storeroom that holds a cap per resource. It starts
  at level 1 with room for 500 units of each good. Each expansion doubles the room and costs more
  than the one before (starting values €100 × 3^expansions, tuned with the balancing page). The
  player can expand as often as they can pay.
- **Full goods stall their buildings**: a building whose output is at the cap waits with its next
  unit ready, like a building that lacks input. It does not use input while it waits, so the
  earlier stages of the chain keep their stock. A run that would overshoot the cap does not happen.
- **Manual actions respect the cap**: a click makes only as many units as fit; with no room, the
  action is unavailable.
- **Nothing is taken away**: selling to customers or bulk buyers frees room. Stock that is already
  above the cap (from an older save) is kept, and production of that good waits until it drops
  below the cap.
- **Full mark in the rail**: a good at its cap is marked as full in the stock list, with a tooltip
  and screen-reader text. Colour alone never carries it.
- **Storeroom block in the rail**: the stock section's heading becomes the storeroom: its
  illustration, level, room per good and an Expand button with the price.
- The rail's short overproduction note is reworded so it no longer claims the storeroom is full
  when it is not ("More than customers order – see Sales"). The sales panel's joke stays.
- The balancing page's scripted player expands the storeroom when a good is full and the
  expansion is cheap enough.
- The save gains the storeroom level (new save format with a migration: older saves start at
  level 1).

## Non-goals

- Separate caps per resource kind or per chain, and a shared total for all goods.
- One-time upgrades that multiply the cap (e.g. a cold room). The storeroom levels are the only
  way to grow it in this change; upgrade effects can come later.
- Spoilage or losing stock over time.
- Capping money, awareness, customers or open orders.
- Offline progress itself (`offline-progress`).

## Capabilities

### New Capabilities
- `storeroom`: the per-resource cap, storeroom levels, expanding, the full mark and saving the
  level.

### Modified Capabilities
- `production-chain`: Stalls cover a full output; Manual production respects the cap.
- `game-screen`: the Resource rail shows the storeroom block and the full mark.
- `game-art`: the storeroom has its own illustration.
- `dev-tools`: the Simulated playthrough's scripted player expands the storeroom.

## Impact

- New `src/game/content/storeroom.ts` (base room, growth, price rule) and
  `src/game/systems/storeroom.ts` (cap, price, expand, full check) with tests.
- `src/game/systems/production.ts` and `manual.ts`: the cap; `production.test.ts`,
  `manual.test.ts`.
- `src/game/state.ts`: `storeroom` level (saved) and `full` hold (not saved).
- `src/game/save.ts`: format 10 with a migration; `save.test.ts`.
- `src/game/balance/player.ts`: the expansion rule; `steady.ts` if its flow model needs the cap.
- `src/ui/ResourceRail.svelte`: storeroom block and full mark.
- `src/ui/art/`: a storeroom illustration.
- `src/i18n/en.json`, `de.json`: storeroom texts and the reworded rail note.
