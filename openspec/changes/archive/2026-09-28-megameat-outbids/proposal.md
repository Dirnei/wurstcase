# Proposal: megameat-outbids

## Why

MegaMeat's offer is supposed to be the game's big temptation, but at about 90% of market value it
pays less per soybean than turning the beans into Tofu-Wurst and selling that, so a sensible
player never feels pulled. Real temptation means the villain openly outbids vegan food: selling
raw soybeans as animal feed should pay more than the finished Tofu-Wurst.

A first implementation of just that showed that the temptation also needs a ceiling. In the
60-minute simulation, a player who only buys fields and sells every bean to MegaMeat ends about 6×
richer than the fair player (€19.9M vs €3.38M), with customers stuck at the 10 starting
neighbours. Lost customers and awareness never feed back into MegaMeat's money, so the feed cost
cannot cap it. MegaMeat's price therefore falls as the player floods its market, and recovers over
time: the first sales are irresistible, but dumping everything on MegaMeat stops paying.

The concept doc did not plan this change in its section 8 sequence. It revisits the MegaMeat
pricing from `bulk-buyers`, `crossover-balancing` and `megameat-temptation`, and updates concept doc
section 3.3 in the same change.

## What Changes

- **BREAKING (balance)**: MegaMeat's full price is tied to the product of each chain, at its
  current price including upgrades:
  - a raw ingredient's full price is the chain product's price +5% per unit (soybeans €3.15 while
    Tofu-Wurst sells for €3; oats €12.60; wheat €26.25),
  - an intermediate's is half of that (tofu €1.575, oat drink €6.30, seitan €13.125), which puts it
    below the biogas plant for tofu and oat drink.
  At a fresh market, one soybean pays more than one Tofu-Wurst, and pressing beans into tofu before
  selling to MegaMeat loses money.
- **Flooded market**: each resource has its own MegaMeat flood level. Every unit sold raises it,
  the price per unit is full price × K ÷ (K + flood) (half price at K = 500 units), and a sale is
  paid unit by unit along that curve, so big dumps pay less per unit. The flood halves every 20 s of
  game time. This caps MegaMeat's income per resource at full price × K × ln 2 ÷ H (about €55 per
  second for soybeans), however much the player produces. K and H are content data, tuned with the
  balancing page (K = 500, H = 20 s).
- Price upgrades raise MegaMeat's full price too: with "mustard on the side" (Tofu-Wurst €4),
  soybeans' full price is €4.20.
- MegaMeat buys in lots of 20 units; each sale pays whole euros.
- The MegaMeat offer shows the market level (percentage and meter) and the time until it is back
  at 95%, in fixed-width slots.
- The flood levels are saved (new save format 13 with a migration: older saves start fresh).
- The balancing page gets a tempted strategy (fields only, all raw to MegaMeat) and acceptance
  checks: tempted out-earns fair at 5 and 10 minutes, fair ends with at least 1.5× the total earned
  at 60 minutes.
- The biogas plant is unchanged: about 67% of market value, lots and prices as today, never flooded.
- The price of feeding MegaMeat (customers and awareness lost per euro) is unchanged in rule; its
  feed horizon drops from 10 to 8 minutes, so a player who feeds MegaMeat its surplus still ends
  with less than half the fair player's customers now that the flood limits how much it sells.

## Non-goals

- New buyers, or MegaMeat buying finished products.
- Changing the biogas plant.
- Changing campaigns, awareness production or the feed cost rule.
- A shared flood across resources.
- A warning dialog before selling to MegaMeat; the offer already shows the cost and the market.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `bulk-sales`: Bulk buyers (full price tied to the chain product; biogas rule for raw ingredients
  only), Selling in bulk and Price of feeding MegaMeat (scenario numbers), and new Flooded market
  and Market flood is saved requirements.
- `dev-tools`: the Bulk buyer table (full prices and MegaMeat's cap) and the Simulated playthrough
  (tempted strategy and acceptance checks).

## Impact

- `src/game/content/buyers.ts`: MegaMeat's pegged pricing (already in the working tree) plus
  `flood: { halfPriceUnits: 500, halfLifeSeconds: 20 }`; the feed horizon 480 s.
- `src/game/systems/bulkSales.ts`: sale value along the flood curve, flood raised on sale; a new
  `recoverMarkets(state, seconds)` called from `tick()`.
- `src/game/state.ts`, `src/game/save.ts`: `megaMeatFlood` per resource (Decimal), format 12 → 13.
- `src/game/balance/steady.ts`, `curves.ts`, `player.ts`, `simulate.ts`: state-aware helpers (in the
  working tree), the flood in the surplus price, and the tempted strategy.
- `src/ui/BulkBuyersPanel.svelte`: market level, meter and recovery time.
- `src/dev/DevPage.svelte`: bulk buyer table, tempted strategy option.
- `src/i18n/en.json`, `de.json`: market texts.
- `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`: section 3.3.
- Tests: `bulkSales.test.ts`, `content.test.ts`, `save.test.ts`, `tick.test.ts`, `simulate.test.ts`.
- The worker's uncommitted pegged-pricing implementation stays in the working tree and is built on.
- `bulk-sell-shares` is queued behind this change; its buttons will show values along the flood
  curve.
