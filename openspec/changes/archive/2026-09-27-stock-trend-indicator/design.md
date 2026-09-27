# Design

## Context

`tick(state, seconds)` in `src/game/tick.ts` runs production, awareness conversion and order
taking. Stock moves in whole units: every building type completes whole units, so a resource
made at 0.5/s grows by 1 every other second and not at all in most 100 ms ticks. Player actions
(`performManual`, `sell`, `bulkSell`, `buyBuilding`) change stock outside `tick()`.

`GameState` already has non-saved fields (`waiting`, `shortage`) that `writeState` in
`src/game/save.ts` leaves out and that `readState` gets empty from `createInitialState()`.
`StockPanel.svelte` reads each shown resource's stock and short flag through `readGame`.

## Goals / Non-Goals

**Goals:**
- The trend reads the same whether time came in one big step or many small ones.
- Constant cost per tick, independent of how long the game has run.

**Non-Goals:**
- A rate in units per second for the UI (the data would allow it, but it is not shown now).

## Decisions

### 1. Measure what `tick()` changed, not the theoretical rates

`tick()` copies the stock before its systems run and hands the difference to the trend system
afterwards. This covers everything that happens on its own (production, input use, automatic
sales) and nothing the player does, because player actions never run inside `tick()`.

*Alternative:* compute net rates from building counts, ratios and the order rate. Rejected:
it has to repeat the logic of production and sales (waiting buildings, most-expensive-first
selling, the order cap) and would say "falling" for a stock sitting at 0 that is used as fast as
it arrives.

*Alternative:* compare the stock now with the stock 10 seconds ago. Rejected: a manual click or
a bulk sale would flip the arrow, which the spec rules out.

### 2. A 10-second window in 1-second buckets

New non-saved field on `GameState`:

```ts
/** Net stock change from passing time, newest bucket last; each bucket covers up to 1 s. Not saved. */
trend: { seconds: number; change: Record<ResourceId, Decimal> }[]
```

`recordTrend(state, before, seconds)` adds the tick's change to the newest bucket while it is
under 1 second, otherwise starts a new bucket, then drops buckets that lie completely outside
the last 10 seconds. That keeps at most 11 buckets whatever the tick size.

`stockTrend(state, resource)` sums the change over the window. When the oldest bucket reaches
past the 10-second window, only its share inside the window counts (change × share of its
seconds). This makes one 60-second tick (tests, a tab coming back from the background) give the
same answer as 600 small ticks, and a long step's trend reflects its average rate.

*Alternative:* an exponential moving average of the rate. Rejected: whole-unit steps make it
jitter around zero for balanced chains, and it needs a tuned dead zone per scale.

### 3. Thresholds

In `src/game/systems/trend.ts`:

```ts
export const TREND_WINDOW_SECONDS = 10
/** Net change over the window that still counts as steady, so single whole-unit steps do not flicker. */
export const TREND_STEADY_UNITS = 1
```

Rising when the net change is > 1, falling when < −1, steady otherwise. A resource with an entry
in `state.shortage` is always steady: its stock hovers between 0 and one input batch, and the
3-second shortage hold already smooths that out. The shortest rate in the game (Leverkas oven,
0.25/s) still makes 2.5 units per window, so one building is enough to show rising.

### 4. UI

`StockPanel.svelte` adds `trend: stockTrend(state, resource)` to each item and renders after
the amount a mark with `aria-hidden="true"` and `title={t(`stock.trend.${trend}`)}`, plus the
label in the existing `.visually-hidden` span. Glyphs: ▲ rising (`--accent`), ▼ falling
(`--danger`), ▬ steady (`--text-muted`). The `dl` gets a third column of fixed width so the
amounts stay right-aligned.

New i18n keys `stock.trend.rising` / `.falling` / `.steady`: EN "rising" / "falling" /
"steady", DE "steigend" / "fallend" / "gleichbleibend".

### Files

- **Added:** `src/game/systems/trend.ts`, `src/game/systems/trend.test.ts`
- **Changed:** `src/game/state.ts` (field `trend`, `[]` in `createInitialState`),
  `src/game/tick.ts` (snapshot before, `recordTrend` after), `src/game/tick.test.ts`,
  `src/game/save.test.ts` (trend not saved), `src/ui/StockPanel.svelte`, `src/i18n/de.json`,
  `src/i18n/en.json`
- **Content entries:** none. The two constants live in the system file, next to
  `SHORTAGE_HOLD_SECONDS`-style tuning constants.

## Risks / Trade-offs

- [A short tick with a big batch (many copies finishing at once) can push a balanced resource
  past ±1 for a moment] → in late game a balanced flow of many units per second is rare and
  usually shows as short; if it flickers in play-check, scale the dead zone with the gross flow.
- [Decimal copies of 9 resources per tick add allocation in the live loop] → 9 Decimals per
  tick at the live tick rate is negligible next to production itself.
- [The trend lags up to 10 s behind a change] → intended; it is what keeps it calm.

## Migration Plan

No save version change: `trend` is not written and `readState` starts from
`createInitialState()`, so it is empty after every load.
