# Proposal

## Why

The sold-per-minute and income-per-minute figures always divide by the full 60 s window. After a
new game or loading a save the window is empty, so the figures start at 0 and climb slowly for a
whole minute, even when the assistant sells at a steady rate from the first second. For that
minute the income figure is simply wrong, and it is wrong every time the player opens the game.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It refines the sales figures that
`sales-metrics` added on top of row 5 (`sales-and-customers`).

## What Changes

- Sold and income figures are divided by the game time the window actually covers, not always by
  60 s. Steady sales show close to their real rate after a few seconds instead of after a minute.
- That time counts as at least 10 s, so a single sale right after loading does not show a huge
  rate (a hand sale of 3 Tofu-Wurst shows 18/min instead of 180/min).
- Once 60 s of game time have passed, the figures are exactly as today.
- Still not saved: after loading or starting a new game they show 0 until something is sold.

## Non-goals

- Saving the sales window. Offline progress (row 11) is the place to decide what a loaded game
  shows about the time away.
- Predicting income from customers and production before anything is sold.
- Changing the stock trend window of `stock-trend-indicator`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `sales`: the "Sales figures" requirement averages over the covered part of the window (at
  least 10 s) instead of always over 60 s.

## Impact

- `src/game/systems/rollingWindow.ts`: new helper for the game time the window covers.
- `src/game/systems/salesStats.ts`: `soldPerMinute` divides by that time.
- Tests in `rollingWindow.test.ts` and `salesStats.test.ts`.
- No UI, i18n or save format change.
