# Tasks

## 1. Rolling window

- [x] 1.1 Add tests to `src/game/systems/rollingWindow.test.ts` for `covered`: 0 when empty, the summed bucket seconds while under the window, capped at the window for many small steps and for one 120 s step; verify they fail
- [x] 1.2 Implement `covered(buckets, windowSeconds)` in `src/game/systems/rollingWindow.ts`; verify the rolling window tests pass

## 2. Sales figures

- [x] 2.1 Add tests to `src/game/systems/salesStats.test.ts` for the new scenarios: 1 Leverkas every 2 s for the first 20 s shows 30/min and €750/min; 3 Tofu-Wurst sold by hand at the start show 18/min and €54/min; switch the 59.9 s hand-sale expectations to `toBeCloseTo`; verify the new tests fail
- [x] 2.2 In `src/game/systems/salesStats.ts`, add `MIN_SALES_SECONDS = 10` and divide `soldPerMinute` by `max(covered, 10)` instead of 60, updating its doc comment; verify `salesStats.test.ts` and `tick.test.ts` pass

## 3. Verification

- [x] 3.1 Run `npm test` and `npm run build` and confirm both succeed
- [x] 3.2 Play-check in the browser (dev server or the running container): after reloading a game with the assistant hired, income per minute shows close to its steady value within about 10–20 s instead of climbing for a minute; a single hand sale right after reloading shows a modest rate that fades over a minute
