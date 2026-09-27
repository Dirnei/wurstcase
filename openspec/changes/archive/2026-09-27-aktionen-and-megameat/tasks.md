# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/aktionen.ts`, `megaMeatEvents.ts` and `headlines.ts` with the design's values and hint list, including at least 12 satirical headlines with thresholds from €0 to €20,000. Extend the content test:
  - ids are unique
  - costs and cooldowns are positive
  - exactly one Aktion ends events
  - `requiresSpecies` names a known species
  - every event has a positive duration and at least one factor
  - every hint clause names known buildings and Aktionen
  - at least 12 satirical headlines, at least 4 of them at €0

  Verify `npm test` passes
- [x] 1.2 Add `awareness`, `awarenessProgress`, `aktionen` and `megaMeat` to `GameState` and to the new-game test; verify `npm run check` and `npm test` pass

## 2. MegaMeat counter-events (tests first)

- [x] 2.1 Write `src/game/systems/villain.test.ts`. Verify the tests fail. Cases:
  - no event in an hour without an Aktion
  - the first starts 60 s after the first Aktion
  - the order is ad campaign, study, billboards, then the ad campaign again
  - each event ends after its duration
  - the next starts exactly 300 s after the end
  - `endEvent` also schedules the next after 300 s
  - `activeFactors` for each event and for none
  - running a second Aktion before the first event does not move the schedule
- [x] 2.2 Implement `src/game/systems/villain.ts`; verify the tests pass

## 3. Awareness pool and factors (tests first)

- [x] 3.1 Extend `awareness.test.ts`. Verify the new tests fail. Cases:
  - 3 chickens for 10 s → pool +30
  - 1 chicken for 15 × 0.1 s → 1, then 2 after 0.5 s more
  - the ad campaign halves the rate and the pool (+15)
  - the study stops conversion but keeps `conversionProgress` and fills the pool (+3,000 at 100/s for 30 s)
  - conversion never takes from the pool
- [x] 3.2 Implement `gatherAwareness` and the factors in `awareness.ts`; verify all awareness tests pass

## 4. Aktionen (tests first)

- [x] 4.1 Write `src/game/systems/aktionen.test.ts`. Verify the tests fail. Cases:
  - the panel is hidden at €999 and shown at €1,000
  - the viral video needs €15,000 and a pig
  - the fact check is offered only after the first event started
  - flyers at 10,000 customers with a pool of 150 → 10,010 customers and a pool of 50, 30 s cooldown
  - 10 s later → `'cooldown'` with 20 s left
  - a pool of 99 → `'awareness'`
  - the open farm day at 19,000 customers → 19,015
  - the fact check with 90 s of ad campaign left and a pool of 400 → event ended, pool 100
  - the fact check without an event → `'noEvent'`
  - the billboards double costs (flyers 200, fact check 600)
  - money never changes
  - the first run schedules the first event
- [x] 4.2 Implement `src/game/systems/aktionen.ts` and add `advanceVillain`, `gatherAwareness` and `coolDown` to `tick()` in the design's order. Extend `tick.test.ts` so a run of flyers leads to the ad campaign 60 s later, and the pool shrinks under it. Verify all tests pass

## 5. Ticker selection (tests first)

- [x] 5.1 Write `src/game/systems/ticker.test.ts` with a fixed `random`. Verify the tests fail. Cases:
  - a new game shows the soybean field hint within the first two headlines
  - after buying a field the hint is gone and the tofu press hint appears
  - with no applicable hint every headline is satirical
  - satirical headlines above `totalEarned` never appear
  - 4 in a row are distinct when at least 4 are available
  - each hint's clauses evaluate correctly (one case per clause kind)
- [x] 5.2 Implement `src/game/systems/ticker.ts`; verify the tests pass

## 6. Save format 6 (tests first)

- [x] 6.1 Extend `src/game/save.test.ts`. Verify the new tests fail. Cases:
  - pool, progress, cooldowns, runs and MegaMeat state round-trip, including an active event
  - a format 5 save with 3 chickens and 40 customers migrates with an empty pool and no events
  - rejects a fractional pool, negative cooldowns and non-integer runs
  - ignores unknown Aktion ids
  - an unknown active event is dropped and the next event scheduled
  - an out-of-range `nextIndex` resets to 0
- [x] 6.2 Bump `CURRENT_FORMAT` to 6, add migration 5 → 6, and read and write the fields; verify all save and slot tests pass

## 7. UI and text

- [x] 7.1 Add the DE and EN keys for:
  - Aktion names, effects, cooldown and lacking labels
  - the pool label
  - event names, descriptions, effects and breaking news
  - all hints and satirical headlines (the design's drafts plus the remaining satire)
  - the "reduced" rate note

  Verify the dictionary test passes
- [x] 7.2 Build `AktionenPanel.svelte` (pool, event banner with seconds left, Aktion buttons with estimate, cooldown and lacking reason) and add it after the Lebenshof in `App.svelte`. Mark the reduced rate in `LebenshofPanel.svelte`. Verify `npm run check` passes
- [x] 7.3 Build `NewsTicker.svelte` (15 s rotation, breaking news on `megaMeat.started` increase, `aria-live="polite"`, fade-in, no marquee) and place it under the header on the game route; verify `npm run check` passes

## 8. Verification

- [x] 8.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages:
  - a new game shows the ticker and the soybean field hint
  - hints change as fields, press, assistant, Lebenshof and wheat are bought
  - the Aktionen panel appears at €1,000 earned
  - flyers convert customers, take awareness and cool down
  - the ad campaign starts 60 s after the first Aktion, with breaking news and a banner, and halves the rate
  - the fact check ends it
  - the study and billboards follow in order
  - reloading during an event and a cooldown keeps both
  - a format 5 save exported before this change imports with an empty pool
