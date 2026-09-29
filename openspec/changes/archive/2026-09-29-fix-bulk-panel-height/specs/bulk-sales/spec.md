## MODIFIED Requirements

### Requirement: Flooded market
Every unit sold to MegaMeat SHALL flood MegaMeat's market for that resource, and every finished
product (Tofu-Wurst, Hafer-Cappuccino, Leverkas) sold to the biogas plant SHALL flood the biogas
plant's market for that product; the biogas plant's raw ingredients and intermediates SHALL NOT
flood. Each flooded market SHALL have its own flood level, measured in euros of full price (a
sale of n units at a full price of p adds n × p), starting at 0 in a new game. At flood level F,
the buyer SHALL pay the full price × K ÷ (K + F) per unit, where K is the half-price flood
(€1,575: 500 soybeans at €3.15, 125 oats, 60 wheat, 1,000 tofu, 250 oat drink or 120 seitan at
MegaMeat's base full prices; about 93 Leverkas at €17, 197 Hafer-Cappuccino at €8 or 788
Tofu-Wurst at €2 at the biogas plant's lot prices): at a flood of K the price is half the full
price. A sale of n units at full price p and flood F SHALL pay K × ln((K + F + n × p) ÷ (K + F)),
rounded down to whole euros, so every unit sold lowers the price of the next, and SHALL then
raise the flood by n × p. Because K is the same in euros for every market, each market pays at
most about €55 per second however much the player dumps.

The flood SHALL fall with passing game time, halving every H seconds of game time (20 s), and
SHALL fall the same whether time passes in one tick or many. Player actions other than sales to
that buyer SHALL NOT change it. K and H SHALL be content data, the same for both buyers; K =
€1,575 and H = 20 s are the values the balancing page settled on.

Each offer of a market that floods SHALL show, while the market is below 100%, the market's
current level as a percentage of the full price, a meter of that level, and while it is below 95%
the game time until it is back at 95%. These figures SHALL sit in one flood slot on the offer's
line, which is reserved at the same width whether or not they show, in digits of equal width, so
the market flooding or recovering never moves or resizes anything on the Verkauf tab. At 100% the
slot SHALL stay empty.

#### Scenario: Fresh market has an empty slot
- **WHEN** MegaMeat's soybean market is at 100%
- **THEN** its soybean offer shows no level, meter or time, and after the player sells soybeans
  to MegaMeat, the level and meter appear in that slot without moving the offer's price or button

#### Scenario: Fresh market
- **WHEN** nothing has been sold to MegaMeat and the player sells 20 soybeans at a full price of
  €3.15
- **THEN** the sale pays €61, and the soybean flood is €63

#### Scenario: Flooded to half
- **WHEN** the soybean flood is €1,575 and the player sells 20 soybeans at a full price of €3.15
- **THEN** the market shows 50% before the sale, and the sale pays €31

#### Scenario: Big dump
- **WHEN** the market is fresh and the player sells 1,000 soybeans at once
- **THEN** the sale pays €1,730 instead of the €3,150 the full price would give

#### Scenario: Wheat floods as fast in euros
- **WHEN** the wheat market is fresh and the player sells 60 wheat at a full price of €26.25
- **THEN** the sale pays €1,091 instead of €1,575, and the market shows 50% afterwards

#### Scenario: Recovery
- **WHEN** the soybean flood is €1,575 and 20 seconds of game time pass
- **THEN** the flood is €787.50, the market shows 67%, and the offer shows about 1:05 until 95%

#### Scenario: Split ticks
- **WHEN** the same flood falls once for 20 seconds and once in 200 ticks of 0.1 seconds
- **THEN** both end at €787.50, within a rounding error

#### Scenario: Markets are separate
- **WHEN** the player floods soybeans with 1,000 units sold
- **THEN** MegaMeat's tofu, oat and wheat markets stay fresh, and so does the biogas plant's
  Tofu-Wurst market

#### Scenario: Income is capped
- **WHEN** a player sells any one resource to MegaMeat, or any one finished product to the biogas
  plant, as fast as any production allows
- **THEN** the buyer pays at most about €55 per second for it on average (K × ln 2 ÷ H), for
  wheat at €26.25 as much as for soybeans at €3.15 or Leverkas at €17

#### Scenario: Biogas is not flooded
- **WHEN** the player sells 1,000 soybeans to the biogas plant
- **THEN** its lot stays 7 soybeans for €3, and neither MegaMeat's soybean flood nor any biogas
  product market changes: the biogas plant's raw ingredients and intermediates never flood

#### Scenario: Biogas products flood
- **WHEN** the biogas plant's Leverkas market is fresh and the player sells 100 Leverkas at its
  lot price of €17
- **THEN** the sale pays €1,152 instead of €1,700, and the Leverkas offer shows 48% afterwards
