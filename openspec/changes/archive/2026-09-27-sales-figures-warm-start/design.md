# Design

## Context

`soldPerMinute` in `src/game/systems/salesStats.ts` sums the sales window with
`sum(state.sales, product, 60)` and always divides by 60 s (decision 4 of the archived
`sales-metrics` design). `state.sales` is a list of about 1 s buckets from
`src/game/systems/rollingWindow.ts`; it is not saved, so it starts empty after loading and
`advance()` adds a bucket's worth of game time on every tick. The buckets therefore already know
how much game time the window covers.

## Goals / Non-Goals

**Goals:**
- Steady sales show close to their real rate within seconds of loading or starting a game.
- A lone sale right after loading does not show an absurd rate.
- Unchanged figures once the window is full.

**Non-Goals:**
- Saving the window, or predicting income before anything sells.
- Touching the stock trend, which reads a net change, not a rate.

## Decisions

### 1. Divide by the covered time, at least 10 s

`soldPerMinute = sum over window × 60 / max(covered, 10)`, where `covered` is the game time held by
the buckets, capped at the 60 s window. This replaces decision 4 of `sales-metrics`: its reason
for the fixed divisor was the 180/min spike after one hand sale; the 10 s floor limits that to
18/min, which fades within a minute and is close to what a player clicking every few seconds
really sells.

*Alternatives:*
- Save the window: fixes loading but not a new game, and adds a save field for a display figure.
- Predict income from customers and production: a second model of the sales rules that can drift
  from `fillOrders`.
- A smaller floor (e.g. 5 s): faster, but assistant sales come in whole units, so the first
  seconds jump more.

### 2. New helper `covered(buckets, windowSeconds)` in `rollingWindow.ts`

Returns `min(sum of bucket seconds, windowSeconds)`. It lives next to `sum` because it walks the
same buckets; `salesStats.ts` keeps the constant `MIN_SALES_SECONDS = 10`.

A single long tick (e.g. 120 s) yields a bucket longer than the window; the cap keeps the divisor
at 60, matching the share-of-bucket rule in `sum`.

### Files

- Changed: `src/game/systems/rollingWindow.ts` (+ `covered`), `rollingWindow.test.ts`.
- Changed: `src/game/systems/salesStats.ts` (`soldPerMinute` divisor, doc comment),
  `salesStats.test.ts`.
- No content entries, UI, i18n or save changes.

## Risks / Trade-offs

- [Early figures are noisy] With few sales in the first 10–20 s the figure jumps with each unit →
  acceptable; it settles as the window fills and is far closer than 0.
- [Existing test measured at 59.9 s] Dividing by 59.9 s instead of 60 s gives 3.005 instead of 3 →
  the test uses `toBeCloseTo`; the panel shows 3.0 either way.
