# Design

## Context

See proposal.md (Why) and the `dev-tools` and `container-deployment` delta specs. The current code:

- **Content:** buildings are data (`BUILDINGS`: chain, input ratio, rate, base price, unlock) with
  `PRICE_GROWTH` 1.10. Products have prices, and bulk buyers have lots.
- **Manual actions:** each does one unit of a building's step.
- **Simulation:** `tick(state, seconds)` is the single simulation path, and the live loop runs it
  every 100 ms. Player actions are plain functions on `GameState` (`buyBuilding`,
  `performManual`, `sell`, `hireAssistant`, `bulkSell`).
- **Routing:** `src/legal/route.ts` maps hashes to `'game' | 'impressum' | 'datenschutz'`, and
  anything else is the game.
- **Container:** at start, `docker/40-legal-json.sh` writes `/tmp/legal/legal.json`, which
  nginx serves with `no-cache`. The game fetches it lazily.
- **Tests:** Vitest runs `src/**/*.test.ts` in node.

## Goals / Non-Goals

**Goals:**
- All balancing math lives in pure TypeScript under `src/game/balance/`, tested like the other
  systems. The Svelte page only renders it.
- The scripted player drives the real `tick()` and the real action functions, so it never drifts
  from the rules.
- Players pay nothing for this: no extra request, no extra download, no game behaviour change.

**Non-Goals:**
- Big-number precision in charts. Act 1 values fit comfortably in `number`, so the balance module
  converts Decimals with `toNumber()`.
- A general optimiser (see proposal Non-goals).

## Decisions

### Files

```
src/game/balance/value.ts        veganValue(resource), buildingIncome(id), chainBalance(chain),
                                 manualPass(chain): { clicks, euros }
src/game/balance/curves.ts       costCurve(id, maxN), paybackCurves(maxN), demandCeiling(customers[]),
                                 bulkTable()
src/game/balance/steady.ts       steadyIncome(buildings, customers): €/s at steady state, with
                                 chain throughput and most-expensive-first demand
src/game/balance/player.ts       scripted player: one decision step on a GameState
src/game/balance/simulate.ts     simulate({ minutes, clicksPerSecond }): samples + purchase log
src/game/balance/milestones.ts   MILESTONES (data) and pacingTable(log)
src/dev/enabled.ts               devToolsEnabled(): DEV → true, else fetch ./dev.json
src/dev/DevPage.svelte           the page; imported dynamically
src/dev/Chart.svelte             thin uPlot wrapper (series, log/linear y, legend, cursor readout)
src/legal/route.ts               + 'dev'
src/App.svelte                   route 'dev' → {#await} dynamic import when enabled, else game
docker/41-dev-json.sh            writes /tmp/dev/dev.json from DEV_TOOLS
docker/nginx.conf                location = /dev.json (alias, no-cache)
Dockerfile, compose.yaml, README.md
```

`veganValue` moves from `content.test.ts` into `balance/value.ts`, and the content test imports
it. There is then one definition for the bulk-price invariant and for the page.

### Enabling

`devToolsEnabled()` returns `true` when `import.meta.env.DEV` is set. Otherwise it
`fetch('./dev.json', { cache: 'no-cache' })` and returns `json.enabled === true`. Any error or 404
returns `false`. The app calls it only when the route is `'dev'`. Only on `true` does it
`import('./dev/DevPage.svelte')`, which Vite splits into its own chunk together with `uplot`. The
main bundle does not grow. While the check runs, the app shows the game, so a disabled `#dev`
never shows a flash of anything else.

`41-dev-json.sh` writes `{"enabled":true}` when `DEV_TOOLS` is exactly `true` and logs
"developer tools enabled at #dev". For anything else it writes `{"enabled":false}`. nginx serves
`/dev.json` like `/legal.json`. The itch.io zip has no `dev.json`, so the fetch 404s and the page
is off.

Alternative: a build-time flag (`VITE_DEV_TOOLS`). Rejected because the author wants the same
image for dev and live instances, switched by compose, just like the legal details.

Alternative: leaving the page out of production builds entirely. Rejected for the same reason. The
chunk is present in `dist/`, but it is never requested unless enabled, and it contains only
balancing code for public content.

### English-only page

The i18n rule covers player-facing text. The developer page is a tool for the author, so its text
is plain English in the Svelte files. That keeps dozens of chart labels out of `de.json` and
`en.json`.

### Income model

- **Vegan value** of a resource: its product price divided by the input ratios down the chain.
  For example, soybean €1, tofu €3, wheat €6.25, seitan €12.50, oats €6 and oat drink €12.
- **Building income:** `rate × veganValue(output)`, the upper bound when its chain and demand keep
  up. The cost and payback charts use it.
- **Chain balance:** the input need per second of each downstream building, divided by the
  upstream output, reduced to the smallest whole ratio:
  - soy: 3 fields : 2 presses : 2 kitchens
  - wheat: 1 : 1 : 1
  - oat: 1 : 1 : 2
- **Manual pass:** the clicks to make one product by hand and the euros it earns. Soy is 5
  clicks for €3; Leverkas is 7 clicks for €25.
- **`steadyIncome`:** per chain, the product throughput is the minimum over the stages, each
  converted through the ratios. Demand is `customers × ORDERS_PER_CUSTOMER`, filled most
  expensive product first. The scripted player uses it to rate purchases in the state it is
  actually in, including the demand cap.

### Scripted player

On each 0.1 s simulation step (the live loop's step), the player:

1. Performs `clicksPerSecond × 0.1` clicks, carrying fractions between steps. Each click goes to
   the chain with the most euros per click among chains whose whole manual pass is unlocked. It
   takes the furthest step that has its input, else the harvest.
2. Sells by hand if possible, until the assistant is hired.
3. Hires the assistant as soon as it is affordable.
4. Picks a target once it has none:
   - Candidates are every unlocked building, plus, per chain, the bundle of one of each of that
     chain's unlocked buildings.
   - Each candidate is scored as price ÷ (`steadyIncome` after − before).
   - Candidates with no gain are skipped. The lowest score becomes the target.
5. Buys the target's pieces, cheapest first, as money allows. It keeps saving otherwise, and
   drops the target after buying it.
6. Calls `tick(state, 0.1)`.

It samples money, total earned, income per second (the change in total earned, averaged over the
last 10 s) and customers once per simulated second. It logs every purchase with the game time.
There is no randomness, so runs are deterministic.

A 60-minute run is 36,000 ticks plus scoring. That should take well under a second. If it
doesn't, the page runs it in chunks with `setTimeout` so the page stays responsive. A web worker
is not needed yet.

Alternative: a closed-form pacing estimate (sum of payback times). Rejected because it misses
stalls, the demand cap and manual play, which are exactly what the tuning is about.

### Pacing milestones

`MILESTONES` is data: `{ id, label, window: [minMin, maxMin], reached: (log) => time | null }`.
The starting entries are the first purchase of the soybean field, tofu press, wheat field,
Leverkas oven and oat field, with the windows in the spec (from concept doc section 5).
`pacingTable` marks each as early, in the window, late, or not reached.

### Page layout

The page has a header ("Wurst Case: balancing", a back-to-game link, and the build's content
summary), then sections in this order:

1. Simulation: controls, run button, three time charts, pacing table, purchase log
2. Cost vs income, with a building picker
3. Payback
4. Chain balance
5. Demand ceiling
6. Bulk buyers

The simulation runs on page load with the defaults, so a reload after a content tweak shows the
new pacing straight away.

### Chart library: uPlot

`uplot` (~45 KB min, no dependencies, MIT) draws fast time series with log axes, a legend and a
cursor readout, which is everything the page needs. It is loaded only in the dev chunk.

Alternative: Chart.js. Rejected because it is about 4× larger and slower for 3,600-point series.

Alternative: hand-drawn SVG. Rejected because axes, log ticks and a cursor readout are more code
to write and test than the page itself.

## Risks / Trade-offs

- [The scripted player plays differently from a human, so its pacing is only indicative] → It is
  deterministic, so it shows the direction of a change reliably. The click rate is adjustable to
  model more or less active play. The pacing table is a guide, not a test gate.
- [Without `lebenshof-rescue`, customers stay at 10, so the simulation plateaus early] → That is
  a true finding about the current build. Whichever of the two changes lands second extends the
  player, the charts and the milestones with animals (see tasks section 6).
- [A dev instance exposes the page to anyone with its URL] → It is only enabled on instances the
  author runs for development, and it reveals only game content.
- [`dev.json` on the itch.io zip is absent, so `#dev` there makes a request that 404s] → It
  happens only if someone types `#dev`, and it goes to the same host.

## Migration Plan

No save or state change. Deploy as usual. Instances without `DEV_TOOLS` behave exactly as before.
Rollback is removing the variable, or reverting the change.
