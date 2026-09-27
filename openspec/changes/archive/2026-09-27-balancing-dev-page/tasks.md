# Tasks

## 1. Income model (tests first)

- [x] 1.1 Write `src/game/balance/value.test.ts`: vegan values (soybean €1, tofu €3, wheat €6.25, seitan €12.50, oats €6, oat drink €12, products their price); soybean field income €1/s and tofu press €1.5/s; chain balance soy 3:2:2, wheat 1:1:1, oat 1:1:2; manual pass soy 5 clicks for €3 and wheat 7 clicks for €25. Verify the tests fail
- [x] 1.2 Implement `src/game/balance/value.ts`, move `veganValue` out of `content.test.ts` and import it there; verify all tests pass
- [x] 1.3 Write `src/game/balance/steady.test.ts`: 1 of each soy building with 100 customers → €1/s (the press gets 1 of the 1.5 soybeans/s it needs); 3:2:2 soy with 100 customers → €3/s (limited by production); 3:2:2 soy with 10 customers → €1.50/s (limited by demand); a field without a press → €0; Leverkas is served before Tofu-Wurst when demand is short. Verify the tests fail, then implement `steady.ts` and verify they pass

## 2. Curves and tables (tests first)

- [x] 2.1 Write `src/game/balance/curves.test.ts`: soybean field cost curve starts €10, €11 with a growing cumulative sum and €1/s per copy; the first payback is 10 s for the soybean field and about 16.7 s for the tofu press; demand ceiling at 10 customers is €1.50/s for Tofu-Wurst and €12.50/s for Leverkas; bulk table soybeans €1.00 / €0.10 (10%) / €0.05 (5%). Verify the tests fail, then implement `curves.ts` and verify they pass

## 3. Simulation (tests first)

- [x] 3.1 Write `src/game/balance/simulate.test.ts` with short runs: two identical runs give the same log and final money; 0 clicks per second gives no purchases and €0; with 2 clicks per second the first purchase is a soybean field or tofu press within 10 minutes; the assistant is hired once affordable; purchases never make money negative; samples are one per simulated second. Verify the tests fail
- [x] 3.2 Implement `player.ts` and `simulate.ts` as in the design; verify the tests pass and a 60-minute run finishes in under 2 s in Vitest
- [x] 3.3 Write `milestones.test.ts` (4:30 inside 2–10 is in window, 1:00 early, 12:00 late, absent not reached), then implement `milestones.ts` with the five milestones; verify the tests pass

## 4. Enabling and route

- [x] 4.1 Extend `src/legal/route.test.ts` with `#dev` → `'dev'`, implement it, and write `src/dev/enabled.test.ts` (with a stubbed fetch): `{"enabled":true}` → on; `{"enabled":false}`, 404, invalid JSON or a network error → off. Verify the tests fail first, then pass
- [x] 4.2 In `App.svelte`, for route `'dev'`: show the game while checking, and on `true` dynamically import `DevPage.svelte`; verify `npm run check` passes and `npm run build` emits the dev page and uPlot in a separate chunk that `index.html` does not reference

## 5. Page

- [x] 5.1 Add `uplot` with `npm install uplot`, and build `Chart.svelte` (series, linear or log y, legend, cursor readout, dark and light via the existing CSS variables); verify `npm run check` passes
- [x] 5.2 Build `DevPage.svelte` with the sections from the design (simulation with controls, time charts, pacing table and purchase log first, then cost vs income with a building picker, payback, chain balance, demand ceiling, bulk buyers) and a back link; verify in `npm run dev` that every chart renders, that the simulation runs on load, and that a changed base price shows after a reload

## 6. Lebenshof (only if `lebenshof-rescue` has already been archived; otherwise that change does this)

- [x] 6.1 Add animals and shelters to the scripted player (when no building adds income, rescue the species with the most awareness per euro, building shelters as needed), plot the price vs awareness per species, and add the first chicken, pig and cow milestones (2–10, 10–20, 20–35 min); extend the simulation tests accordingly and verify they pass

## 7. Container

- [x] 7.1 Add `docker/41-dev-json.sh` (exactly `true` → `{"enabled":true}` plus a log notice, else `{"enabled":false}`), the `/dev.json` location in `nginx.conf` with `no-cache`, the `COPY` in the `Dockerfile`, `DEV_TOOLS: ${DEV_TOOLS:-false}` in `compose.yaml`, and a README section; verify that `docker compose up --build -d` serves `{"enabled":false}` at `/dev.json` by default

## 8. Verification

- [x] 8.1 Run `npm test`, `npm run check` and `npm run build`, then check:
  - `npm run dev` shows the page at `#dev`
  - the container without `DEV_TOOLS` shows the game at `#dev`, and the network log has no dev chunk and no `dev.json` request during normal play
  - after recreating the container with `DEV_TOOLS=true` (no rebuild), `#dev` shows the page and the log has the notice
  - the game's save is unchanged after running a simulation
  - finally, recreate the container without `DEV_TOOLS` and leave it running
