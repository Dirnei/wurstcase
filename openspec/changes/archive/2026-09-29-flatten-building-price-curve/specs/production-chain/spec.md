## MODIFIED Requirements

### Requirement: Buildings
The game SHALL offer three chains of buildings: soybean field → tofu press → Tofu-Wurst kitchen,
oat field → oat mill → café bar (Hafer-Cappuccino), and wheat field → seitan kitchen → Leverkas
oven. Fields SHALL produce their raw ingredient at a fixed rate per second per
building. Processing buildings and kitchens SHALL work in runs: each run takes a fixed amount of
input and makes its output, at a fixed maximum number of runs per second per building. Without
upgrades a run makes 1 unit; yield upgrades add whole units per run without changing the input or
the runs per second. Buildings SHALL produce and consume only whole units: all copies of a
building type work towards the next run together, and each completed run adds its whole output to
stock at once, taking its whole input at that moment. Each building SHALL show how many the player
owns, what it produces per second, its recipe (input per run → output per run) and how far along
its next run is.

The number of copies owned SHALL NOT change a building's output per copy by itself; output per
copy changes only through upgrades. The building SHALL NOT show owned-count milestones.

#### Scenario: Field output
- **WHEN** the player owns 2 soybean fields, each producing 1 soybean per second, and 10 seconds
  pass
- **THEN** the soybean stock has grown by 20

#### Scenario: Processing at full speed
- **WHEN** the player owns 1 tofu press (3 soybeans → 1 tofu, at most 0.5 runs per second), has
  100 soybeans and 10 seconds pass
- **THEN** tofu has grown by 5 and soybeans have dropped by 15

#### Scenario: Whole units only
- **WHEN** the player owns 1 tofu press with plenty of soybeans and 1 second passes
- **THEN** no tofu has been made yet, soybeans are unchanged, and the press shows its next run
  half done

#### Scenario: Unit completes
- **WHEN** another second passes
- **THEN** tofu has grown by exactly 1 and soybeans have dropped by exactly 3

#### Scenario: Efficient run
- **WHEN** the player owns 1 tofu press and the hydraulic press upgrade, has 100 soybeans and 10
  seconds pass
- **THEN** tofu has grown by 10, soybeans have dropped by 15, and the press shows the recipe
  "3 soybeans → 2 tofu" and 1 tofu per second

#### Scenario: Below the first milestone
- **WHEN** the player owns 24 soybean fields and 1 second passes
- **THEN** the soybean stock has grown by 24, and the soybean field shows no milestone

#### Scenario: First milestone
- **WHEN** the player owns 25 soybean fields and no upgrades, and 1 second passes
- **THEN** the soybean stock has grown by 25, and the soybean field shows only its count, its
  output per second and its progress bar

#### Scenario: Milestones stack
- **WHEN** the player owns 50 of each soy chain building and the soy chain's 25 and 50 milestone
  upgrades
- **THEN** the soybean field shows 200 soybeans per second

#### Scenario: Milestone between 50 and 100
- **WHEN** the player owns 75 of each soy chain building and the soy chain's 25, 50 and 75
  milestone upgrades
- **THEN** the soybean field shows 600 soybeans per second

#### Scenario: Last milestone
- **WHEN** the player owns 200 of each soy chain building and all six soy chain milestone
  upgrades
- **THEN** the soybean field shows 12,800 soybeans per second

### Requirement: Buying buildings
The player SHALL be able to buy one building at a time when they have enough money. Prices SHALL
grow per balanced set of the chain, not per copy: each chain SHALL have one set growth, and a
building's price SHALL be its base price × set growth^(copies already owned ÷ the building's share
of a balanced set), rounded up to whole euros. A building's share of a balanced set is how many of
it one product building of its chain needs to run without stalls or surplus at base values (the
Chain proportions requirement). Later chains SHALL grow more slowly per set than earlier ones.
Within a chain, each step's base price SHALL be higher than the step before it (field <
processing < product), because a balanced chain needs more of its earlier steps. Buying SHALL
subtract the price from the money and add one building. A building the player cannot afford SHALL
show its price but SHALL NOT be buyable.

Starting values; the values the balancing page's 60-minute simulation settles on SHALL replace
them here:

| Chain | Set growth | Building | Base price | Share of a set | Growth per copy | Unlock at |
|---|---|---|---|---|---|---|
| Soy | 1.09 | Soybean field | €10 | 1.5 | ×1.059 | start |
| Soy | 1.09 | Tofu press | €25 | 1 | ×1.09 | start |
| Soy | 1.09 | Tofu-Wurst kitchen | €40 | 1 | ×1.09 | start |
| Oat | 1.05 | Oat field | €250 | 2 | ×1.025 | €30,000 |
| Oat | 1.05 | Oat mill | €500 | 1.5 | ×1.033 | €30,000 |
| Oat | 1.05 | Café bar | €700 | 1 | ×1.05 | €30,000 |
| Wheat | 1.045 | Wheat field | €400 | 2 | ×1.022 | €140,000 |
| Wheat | 1.045 | Seitan kitchen | €600 | 1.5 | ×1.030 | €140,000 |
| Wheat | 1.045 | Leverkas oven | €900 | 1 | ×1.045 | €200,000 |

#### Scenario: Cost scaling
- **WHEN** the soybean field (€10, set growth 1.09, share 1.5) is bought and the player owns 2
- **THEN** the next one costs €12 (10 × 1.09^(2 ÷ 1.5), about €11.22, rounded up)

#### Scenario: Cost scaling with many copies
- **WHEN** the player owns 24 soybean fields
- **THEN** the next one costs €40 (10 × 1.09^16, about €39.70, rounded up)

#### Scenario: Product building grows per copy
- **WHEN** the player owns 1 tofu press (€25, share 1)
- **THEN** the next one costs €28 (about €27.25, rounded up)

#### Scenario: Slower growth in a later chain
- **WHEN** the player owns 1 wheat field (€400, set growth 1.045, share 2)
- **THEN** the next one costs €409 (about €408.90, rounded up)

#### Scenario: A whole set multiplies every price once
- **WHEN** the player owns 2 wheat fields (one set's share) and 1 Leverkas oven
- **THEN** the next wheat field costs €418 (400 × 1.045) and the next oven €941 (900 × 1.045,
  €940.50 rounded up):
  one set raises every price in the chain by the set growth once

#### Scenario: Save from before the flatter curve
- **WHEN** a save with 24 soybean fields made under set growth 1.13 is loaded
- **THEN** the player keeps all 24 fields, gets no refund, and the next field costs €40

#### Scenario: Loaded save uses the current rate
- **WHEN** a save made under the per-copy rule is loaded with 2 soybean fields
- **THEN** the player keeps both fields, gets no refund, and the next field costs €12

#### Scenario: Buying
- **WHEN** the player has €15 and buys a soybean field costing €10
- **THEN** money is €5 and the player owns 1 soybean field

#### Scenario: Not enough money
- **WHEN** the player has €9 and a soybean field costs €10
- **THEN** the buy button is disabled and nothing changes

#### Scenario: Later steps cost more
- **WHEN** the base prices are checked for every chain
- **THEN** each processing building costs more than its chain's field, and each product building
  more than its chain's processing building

