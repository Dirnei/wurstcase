# Design: calmer-customer-growth

## Context

See proposal.md - Why. What we found in the code on main (93b2584):

- `content/aktionen.ts` holds each campaign's base `customers` (flyer 20, openFarmDay 300,
  viralReel 1,500). `systems/aktionen.ts` `aktionEstimate` multiplies it by the reach growth,
  the counter-event, upgrade and scandal factors and the unconverted share of the town.
- `content/town.ts` holds `DEMAND_KNEE = 750` and `demandRate`, which every consumer already
  calls: `systems/sales.ts` (`orderRate`, the cap and the overstock check),
  `systems/salesStats.ts`, and on the balance side `steady.ts`, `curves.ts` and the rescue
  valuation in `player.ts`. The previous change centralised the curve, so a single constant moves
  both the game and the simulation.
- The scripted fair player owns about 18 chickens and 15 pigs at 15 minutes. The user's playtest
  had 6 chickens and 3 pigs. The human earns less awareness than the bot, so if the bot's demand
  stays close to production, a human's will too.

**src/game/ files and content entries:** `content/aktionen.ts` (the `customers` of `openFarmDay`
and `viralReel`), `content/town.ts` (`DEMAND_KNEE` and the numbers in its doc comment). Test
files with knee- or reach-dependent numbers are listed in tasks.md. There are no new content
entries and no state, save, UI or i18n change.

## Goals / Non-Goals

**Goals:**
- Demand stays within reach of production through the middle game, so running a campaign
  matters again.
- The first five minutes are identical to main: same flyers, same 0.05 orders per customer below
  the knee.

**Non-Goals:**
- A new demand shape. The knee-and-doubling rule stays; only its knee moves.

## Checks

The playtest decides whether this feels right, not the simulation. The values are starting
values; the user tunes them after playing.

- The existing simulation tests (fed and tempted runs) stay green as regression guards. If one
  moves only because customers are worth less now, adjust its threshold and note it here; do not
  retune other systems to satisfy it.
- No new simulation gate is added. The probe numbers in the proposal show the direction only.
- Knobs for a quick follow-up after the playtest: `openFarmDay.customers` and
  `viralReel.customers` in `content/aktionen.ts`, `DEMAND_KNEE` in `content/town.ts`, and the
  flyers' 20 if the opening turns out too fast as well.

## Decisions

### 1. Two levers, as the user asked

The user named both: fewer customers from campaigns, and less impact from each customer on
orders. The probe shows neither is enough alone:

| Variant (knee, campaigns) | Demand ÷ production at 15 / 20 / 25 / 30 min |
|---|---|
| main (750, full reach) | 3.13 / 1.95 / 2.16 / 2.35 |
| 750, all campaigns halved | 1.60 / 3.01 / – / 4.59 |
| 200, full reach, 0.75 per doubling | 1.17 / 1.00 / – / 0.75 |
| **200, big two halved** | **1.29 / 1.10 / 1.16 / 0.84** |

Halving the campaigns alone lowers income. The bot then builds more slowly, so the ratio gets
worse. Lowering the knee alone works, but the town fills up by minute 30 (9,452 customers), and
campaigns stop mattering from the other side. Both together keep demand and production close
until production overtakes at about 28 minutes. That is ten minutes earlier than on main.

### 2. Keep the flyers, halve the two big campaigns

At 6 chickens and 3 pigs, the viral video (1,500 per run at base, for 6,000 awareness) and the
open farm day are the jumps the user felt. The flyers carry the opening, which the user said felt
good. Halving the big two keeps their ratio to each other (a viral video still wins 5 open farm
days). Each of their customers now costs twice the awareness: 10 points at the open farm day and
8 at the viral video, against 5 at the flyers. The big campaigns stay the faster way to fill the
town, because of their reach per run, but are no longer the cheaper one.

- *Alternative: a campaign reach factor applied to all campaigns.* Rejected. It needs a new
  constant and changes the opening.
- *Alternative: raising the campaign costs instead of cutting the reach.* Rejected. It changes
  what awareness is worth, and so the rescue valuation and the Lebenshof's role. The user asked
  for fewer customers, not pricier campaigns.

### 3. Lower the knee instead of adding a slope factor

A knee of 200 makes each doubling add 10 orders per second. The rule stays one sentence
("every doubling adds as many orders as the first 200 customers place"), and it stays one
constant. A separate slope (0.75 of the knee per doubling at knee 200) measured about the same
but adds a second knob and a harder sentence.

- *Alternative: lowering `ORDERS_PER_CUSTOMER`.* Rejected. The user wants the beginning kept,
  and 10 customers must still order 0.5 per second.

## Risks / Trade-offs

- [The late game runs in surplus from about minute 28, so the bulk buyers carry more of the
  income, and the fair total at 60 minutes drops from €13.6M to about €9.7M] → That is the
  intended outlet: slow customer growth, with the surplus going to the bulk buyers. The user playtests
  the pacing.
- [After minute 30, campaigns add few orders (the whole town orders about 76 per second), so the
  late campaigns feel weak] → Accepted for Act 1. The Neustart and later acts are where demand
  grows again. If the playtest finds the late game flat, raising the knee is the first knob.
- [The human player has fewer animals than the bot, so the human's customers grow more slowly
  than the table shows] → That is the direction the user asked for, and the flyers keep the first
  minutes as they are.
- [Existing saves with many customers see demand drop at once] → Intended. The existing cap rule
  trims open orders above the new cap on the next tick.

## Migration Plan

No save migration. Customers and runs stay as saved; only the rates derived from them change.
Rollback is reverting the two content values and the knee.
