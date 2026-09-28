# Design: customer-demand-curve

## Context

See proposal.md - Why. What we found in the code:

- `content/town.ts` holds `ORDERS_PER_CUSTOMER = 0.05`, `ORDER_CAP_SECONDS`, `OVERSTOCK_SECONDS`
  and `POPULATION = 20_000`.
- The linear rule `customers × ORDERS_PER_CUSTOMER × ordersFactor` is written out in five places:
  `systems/sales.ts` `orderRate` (which the cap and the overstock check build on),
  `systems/salesStats.ts` `demandPerMinute`, `balance/steady.ts` `steadyIncome`,
  `balance/curves.ts` `demandCeiling`, and `balance/player.ts` `rescueScore` (orders the won
  customers add).
- The game side works in `Decimal` (`state.customers`), the balance side in plain numbers.
  Customers never exceed `POPULATION`, so a number is exact for both.
- Campaigns already have diminishing reach (proportional to the unconverted share of the town),
  so customers approach 20,000 asymptotically; demand must stay finite and sensible there.

**src/game/ files and content entries:** `content/town.ts` (new constant `DEMAND_KNEE = 750` and
a pure `demandRate(customers, factor)`), `systems/sales.ts`, `systems/salesStats.ts`,
`balance/steady.ts`, `balance/curves.ts`, `balance/player.ts`. No new content entries, no state
or save change, no UI change (the panel already shows demand as a number).

## Goals / Non-Goals

**Goals:**
- One function owns the curve; every consumer calls it, so the sim and the game cannot drift.
- The first 750 customers behave exactly as before, so existing scenarios and early pacing hold.

**Non-Goals:**
- A per-product demand split or price elasticity; demand stays a single order stream filled
  most-expensive-first.

## Acceptance (the simulation's gates)

Hard gates, checked by the validator on the archived `megameat-scandal` content (e17f6fb:
scandal K €10,000 / H 600 s, biogas products flooded; there the fed run earns 0.541 × fair with
2,161 against 9,245 customers at 30 minutes, fair €3.81M, Leverkas 51.6 min):

1. Feeding the industry, as `megameat-scandal` defines it: the fed run (fair strategy, MegaMeat
   as surplus buyer) has fewer customers than the fair run at 30 minutes and has earned at most
   0.75 × its total at 60 minutes. The curve changes what a customer is worth, so it can move
   this gate.
2. Tempted player: ahead of the fair player at 5 and 10 minutes; fair earns at least 1.5 × tempted
   at 60 minutes.

Reported, not gated: the chain set payback chart (its crossover cannot move, because
`chainSetPayback` values a set at product prices and never reads demand; the curve reaches the
scripted player only through `steadyIncome` and the rescue valuation), the fed run's customer
share, and the pacing windows (first Leverkas oven 20–55 min, first cow 18–35 min, the rest as in
`milestones.ts`), which the user playtests.

Tuning knob: `DEMAND_KNEE` from 500 to 1,000 (start 500; set to 750, see Tuning result). Sanctioned fallback, in this order, if
the money gate fails at every knee: the scandal's K and H inside the band the `megameat-scandal`
spec names (K 5,000–10,000, H 300–600 s; the archived values are 10,000 / 600), because the
curve raises what customers are worth and the scandal is the lever that prices feeding them
away. Stop condition: if the gates do not hold with the knee ≤ 1,000 and the scandal inside its
band, the change comes back to the product owner instead of touching the flat rate, the cap
seconds, the campaigns or the bulk buyers.

Order of the factors (the sales delta states it): the curve is applied to the customer count,
then the MegaMeat scandal factor and the orders upgrade factor multiply its result; the order cap
is 30 seconds of that final rate, so it follows the scandal as it does today.

## Decisions

### 1. Knee plus one increment per doubling (logarithmic tail)

`demandRate(c) = 0.05 × (c ≤ K ? c : K × (1 + log2(c / K)))` with `K = DEMAND_KNEE`, applied to the
customer count alone; the orders upgrade factor and the MegaMeat scandal factor multiply its
result afterwards, never the count inside the curve. (In code, `demandRate(c, f)` takes that
product of factors as an optional second argument and multiplies the finished rate by it.)

- Linear up to the knee keeps the tutorial phase and all "10 customers" scenarios untouched.
- Beyond it the rule is one sentence a player or designer can hold: "every doubling of your
  customers adds 37.5 orders a second" at the knee of 750. At the town size (about 27 × knee)
  that is about 215/s (323 with the loyalty card), below the 464 products/s the tuned 60-minute
  run makes by the end, so the last third of the hour runs in surplus.
- *Alternative: a saturating curve `c / (1 + c/K)`.* Rejected: it has a hard ceiling that late
  customers cannot move at all, so campaigns become pointless well before the town is converted.
- *Alternative: a power law `c^0.75`.* Rejected: it also changes the early game (100 customers
  would order 2.8/s instead of 5/s) and its tail is harder to explain.
- *Alternative: lowering the flat rate.* Rejected by the user: the problem is the late game, and
  a flat cut would starve the starting neighbours.

### 2. Marginal orders in the rescue valuation

`rescueScore` currently prices the customers a rescue wins at the flat rate. It becomes
`demandRate(c + won) − demandRate(c)`, so the simulated player stops overvaluing rescues once the
town is largely converted, as a human would notice. `steadyIncome(buildings, customers, …)` keeps
its signature and calls `demandRate` inside.

### 3. The knee is content, not a system constant

`DEMAND_KNEE` lives next to `ORDERS_PER_CUSTOMER` in `content/town.ts` with a doc comment stating
the doubling rule, because it is the balancing knob the simulation may move. If the pacing
milestones fall out of their windows, the knee is retuned first (1,000 doubles every value beyond
the knee); the flat rate and the cap seconds stay.

## Implementation notes (worker)

- **Prose fixed on this base.** The proposal's table and minute-10 figures were measured on
  95239d6; on e17f6fb minute 10 has 428 customers and 21.4 orders/s (not 489 / 24.5), and the table
  now shows the e17f6fb run. Production overtakes demand at 34.7 (knee 500), 38.5 (750) and 49.7
  (1,000) minutes; the proposal says "last third" at the chosen knee. Decision 1 now states that the
  factors multiply the curve's result, not the count inside it.
- **Scenario numbers at knee 750.** Every knee-dependent scenario and test was recomputed. At twice
  the knee the curve meets the flat rate by construction (knee × 2 × 0.05), so the draft's "1,000
  customers → 500 orders, not 1,000" was wrong at any knee; the scenario now says it matches, and
  a new "Four times the knee" scenario (3,000 → 1,125 orders in 10 s, not 1,500) shows the bend.
  Where 1,000 customers gave awkward numbers at 750 (53.06/s), the scenarios use 1,500 or 3,000.
- **Rescue valuation** uses marginal orders `demandRate(c + won, f) − demandRate(c, f)` with the
  orders and scandal factors, as the head of development specified.
- **Simulation time.** The 60-minute default run takes 2.2–2.8 s on the branch against 1.95–2.15 s
  on main on the same busy machine (other sessions running simulations); the fair player buys far
  more with the higher income. Caching the steady model's surplus buyer per upgrade set did not
  help and was not kept. The "under 2 seconds" test threshold is for the head of development.

### Tuning result

Final knee 750 (the head of development's call within 500–1,000); no fallback needed, scandal
unchanged (K €10,000, H 600 s). Sixty-minute runs, all gates pass:

| Run | 5 min | 10 min | 60 min | Customers 30 / 60 min | First Leverkas |
|---|---|---|---|---|---|
| Fair (new reference) | €3.9K | €24.1K | €13.58M | 9,387 / 18,958 | 36.8 min |
| Fed (MegaMeat surplus) | | | €1.88M (0.138 × fair) | 2,150 / 3,566 | 23.5 min |
| Tempted | €12.5K | €25.5K | €0.39M (fair 34.8×) | | |

Before this change (e17f6fb) the fair run earned €3.81M with 9,245 / 17,990 customers and its first
Leverkas oven at 51.6 min; the fair total is now about 3.6×, so it is the new reference for later
changes. Chain set paybacks are unchanged (set 1 58 / 340 / 432 s, set 24 7,883 / 3,813 / 3,151 s).
Pacing: soybean field 0.2 (early), tofu press 4.3, oat field 11.0, wheat field 19.3 (early),
Leverkas oven 36.8, chicken 2.7, pig 8.3 (early), cow 20.2; the early rows are as before.
Demand vs products made in the fair run: 21.4 / 20 per second at 10 min, 129 / 66 at 20, 174 / 74
at 30, 318 / 464 at 60.

## Risks / Trade-offs

- [Pacing shifts because late income drops] → the pacing table is reported alongside the hard
  gates above; the knee is the only knob, and its final value (750) replaces 500 in the spec.
- [The fed player keeps its customers however much it feeds MegaMeat] → the validator's run on
  95239d6 showed the fed player selling more to MegaMeat than before (372k units against 304k)
  and still keeping 66% of the fair run's customers at knee 500, with the old customer-ratio gate
  passing and failing in no order between knees 550 and 1,000. That gate measured a share of a
  town both players saturate; `megameat-scandal` replaces it, and this change is gated on the
  scandal's money-plus-direction check instead.
- [The simulated player buys differently once demand binds, so the trajectory in the proposal's
  table is not what the tuned run shows] → the table is a calibration aid, not an acceptance
  value; the acceptance values are the pacing windows and the tempted checks.
- [`megameat-scandal` (archived as e17f6fb) changed what feeding costs and capped the biogas
  plant; the curve raises the fair run's income several-fold (€13.9M at knee 500 on the flat
  gate), so the fed ratio will land somewhere new] → the money gate is the check, the scandal
  band is the sanctioned fallback, and task 0.1 baselines on e17f6fb before tuning. The fair
  run itself does not feed, so the curve's calibration table (measured on 95239d6, fair −0.7%
  since) still holds within a percent.
- [Existing saves with many customers see demand drop at once] → intended; open orders above the
  new cap are trimmed by the existing cap rule on the next tick, nothing else changes.
