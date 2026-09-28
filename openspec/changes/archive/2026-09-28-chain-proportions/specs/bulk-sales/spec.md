## MODIFIED Requirements

### Requirement: Flooded market
Every unit sold to MegaMeat SHALL flood MegaMeat's market for that resource. Each resource that
MegaMeat buys SHALL have its own flood level, measured in euros of full price (a sale of n units
at a full price of p adds n × p), starting at 0 in a new game. At flood level F, MegaMeat SHALL pay
the full price × K ÷ (K + F) per unit, where K is the half-price flood (€1,575: 500 soybeans at
€3.15, 125 oats, 60 wheat, 1,000 tofu, 250 oat drink or 120 seitan at their base full prices): at
a flood of K the price is half the full price. A sale of n units at full price p and flood F SHALL
pay K × ln((K + F + n × p) ÷ (K + F)), rounded down to whole euros, so every unit sold lowers the
price of the next, and SHALL then raise the flood by n × p. Because K is the same in euros for
every market, each market pays at most about €55 per second however much the player dumps.

The flood SHALL fall with passing game time, halving every H seconds of game time (20 s), and
SHALL fall the same whether time passes in one tick or many. Player actions other than MegaMeat
sales SHALL NOT change it. K and H SHALL be content data; K = €1,575 and H = 20 s are the values
the balancing page settled on.

Each MegaMeat offer SHALL show the market's current level as a percentage of the full price, a
meter of that level, and while it is below 95% the game time until it is back at 95%. These
figures SHALL sit in slots that are reserved whether or not they show, in digits of equal width,
so the recovering market never moves or resizes anything on the Verkauf tab.

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
- **THEN** MegaMeat's tofu, oat and wheat markets stay fresh

#### Scenario: Income is capped
- **WHEN** a player sells any one resource to MegaMeat as fast as any production allows
- **THEN** MegaMeat pays at most about €55 per second for it on average (K × ln 2 ÷ H), for
  wheat at €26.25 as much as for soybeans at €3.15

#### Scenario: Biogas is not flooded
- **WHEN** the player sells 1,000 soybeans to the biogas plant
- **THEN** its lot stays 7 soybeans for €3, and MegaMeat's soybean flood is unchanged

### Requirement: Price of feeding MegaMeat
Every sale to MegaMeat SHALL cost the player customers and awareness. The customers lost SHALL be
the current customers times the sale's euros divided by what the customers spend in the feed
horizon (the customer income per second times the horizon, 1 minute), rounded up to a whole
number. While the customer income is 0, a sale SHALL cost every customer above the starting
neighbours. The awareness lost SHALL be 1 point per €10 the sale pays, rounded up. Customers SHALL
NOT drop below the 10 starting neighbours, and awareness SHALL NOT drop below 0. Sales to the
biogas plant SHALL cost nothing. Before the sale, each of MegaMeat's three sell buttons SHALL show
what its own sale would cost in customers and awareness. The horizon and the euros per awareness
point SHALL be content data; the horizon of 1 minute is what the balancing page settled on, so that
a player who feeds MegaMeat its surplus ends an hour with at most half the fair player's customers
now that MegaMeat's markets flood in euros.

#### Scenario: Feed sale
- **WHEN** the player has 1,000 customers, a customer income of €10 per second and 100 awareness,
  and sells 200 soybeans to MegaMeat at a fresh market for €529
- **THEN** money grows by €529, customers drop to 118 (the sale is about 88% of one minute of
  customer spending) and awareness to 47

#### Scenario: Small sale still costs
- **WHEN** the player has 1,000 customers and a customer income of €10 per second, and sells
  20 soybeans to MegaMeat for €61
- **THEN** customers drop to 898 and awareness by 7

#### Scenario: Starting neighbours stay
- **WHEN** the player has 12 customers and 5 awareness and sells to MegaMeat for €1,000
- **THEN** customers drop to 10 and awareness to 0

#### Scenario: No customer income yet
- **WHEN** the player has 30 customers and a customer income of 0, and sells to MegaMeat
- **THEN** customers drop to 10

#### Scenario: Biogas costs nothing
- **WHEN** the player sells Tofu-Wurst to the biogas plant for €60
- **THEN** customers and awareness are unchanged

#### Scenario: Cost shown before the sale
- **WHEN** the player has 1,000 customers and a customer income of €10 per second, and a MegaMeat
  sale would pay €60
- **THEN** its button shows that it costs 100 customers and 6 awareness

#### Scenario: Cost per share
- **WHEN** the player has 1,000 customers, a customer income of €10 per second and 500 soybeans,
  and MegaMeat's soybean market is fresh at a full price of €3.15
- **THEN** the 10% button (€121) shows a cost of 202 customers and 13 awareness, and the 100%
  button (€1,091) 990 customers (all but the 10 starting neighbours) and 110 awareness

### Requirement: Market flood is saved
Each resource's MegaMeat flood level, in euros of full price, SHALL be part of the save and SHALL
be restored exactly. A save from before the flooded market, or from before the flood was measured
in euros, SHALL load with every flood at 0.

#### Scenario: Reload
- **WHEN** the soybean flood is €400 and the page is reloaded
- **THEN** the soybean flood is still €400 and the market shows the same level

#### Scenario: Older save
- **WHEN** a save from before the flooded market is loaded
- **THEN** every MegaMeat market is fresh and everything else is unchanged

#### Scenario: Save with floods in units
- **WHEN** a save with a soybean flood of 500 units from before the euro flood is loaded
- **THEN** every MegaMeat market is fresh and everything else is unchanged
