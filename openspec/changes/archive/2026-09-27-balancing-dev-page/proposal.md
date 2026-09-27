# Proposal

## Why

Every price, rate and unlock threshold so far is a "starting value, tuned in `release-v1`". Right
now the only way to tune them is to play for an hour. Idle games are balanced with a few
standard curves (see "The Math of Idle Games, Part I", gamedeveloper.com): the cost of the n-th
copy against the income it adds, payback time, and where exponential cost overtakes linear
income. On top of those, a simulated playthrough shows whether the unlocks land in the
target windows of the concept doc (section 5). A developer page that draws these from the
**current** content lets the author see what a change of numbers does before playing it.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is a tool for the pacing work in
row 13 (`release-v1`), and is useful from now on. It takes the balancing part of row 12
(`settings-and-debug`, "dev debug panel"). Speed and resource cheats stay in row 12.

## What Changes

- **Developer page at `#dev`:** in English only, not meant for players. It is available:
  - always under `npm run dev`
  - in a built game only when the server says so. The Docker container turns it on with the
    environment variable `DEV_TOOLS=true`, and `compose.yaml` passes it through (default off).
  - never in the itch.io build, which has no server config.

  When the page is off, `#dev` shows the game as usual.
- **Charts computed from the content, live:**
  - **Cost vs income per building:** the price of the n-th copy and the income per second of n
    copies (log scale), for n = 0–50.
  - **Payback time:** price of the n-th copy ÷ the income it adds, for all buildings on one chart.
  - **Chain balance:** how many fields per processor per kitchen keep a chain running without
    stalls, and what one manual click is worth.
  - **Demand ceiling:** the most income per second that the customers can pay for, by product,
    from 10 customers up to the town size, compared with the production of the buildings.
  - **Bulk buyer check:** each buyer's price per unit next to the vegan value of each resource.
- **Simulated playthrough:** a scripted player runs the real `tick()` from a new game. It clicks
  manual actions at a set rate, sells, hires the assistant, and buys whatever pays back fastest.
  It uses the same systems as the game, so it always matches the current rules. The page shows:
  - money, income per second and customers over time
  - a log of every purchase
  - a pacing table: each milestone's simulated time next to its target window in the concept
    doc, marked in or out of the window

  Duration and click rate can be set on the page.
- **Chart library:** a small charting library is bundled. It is loaded only when the page opens, so
  players never download it.

## Capabilities

### New Capabilities

- `dev-tools`: when and where the developer page is available, the balancing charts and tables,
  and the simulated playthrough with its pacing table. The later cheats from `settings-and-debug`
  (12) join this capability.

### Modified Capabilities

- `container-deployment`: a new environment variable `DEV_TOOLS` that switches the developer page
  on for an instance without rebuilding the image.

## Non-goals

- Changing content values from the page, or saving tuned values. Tuning stays in
  `src/game/content/`, and the page reflects it after a reload (or instantly with hot reload in
  dev).
- Speed-up and resource cheats for the live game: `settings-and-debug` (12).
- An optimal-play solver. The scripted player is a simple, predictable heuristic. It is a
  yardstick, not the best possible play.
- Prestige, Aktionen and upgrade curves: they are added to the page by the changes that
  introduce those mechanics.
- Hiding the page's code from a determined visitor. The code is inert unless turned on and holds
  nothing secret.

## Impact

- New: `src/game/balance/` (pure TypeScript: curves, steady-state income model, scripted player,
  milestones), `src/dev/` (Svelte page and chart wrapper, loaded lazily),
  `docker/41-dev-json.sh`, and the dependency `uplot`.
- Changed: `src/legal/route.ts` and `src/ui/route.svelte.ts` (the `#dev` route), `src/App.svelte`
  (lazy page), `docker/nginx.conf` (`/dev.json`), `Dockerfile` (entrypoint script),
  `compose.yaml` (`DEV_TOOLS`), and `README.md`.
- No change to game rules, state or save format.
- Ordering with `lebenshof-rescue`: whichever change lands second adds the animals and shelters
  to the scripted player, the curves and the pacing table (first chicken, pig and cow).
