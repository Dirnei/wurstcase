## MODIFIED Requirements

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
| Soy | 1.13 | Soybean field | €10 | 1.5 | ×1.085 | start |
| Soy | 1.13 | Tofu press | €25 | 1 | ×1.13 | start |
| Soy | 1.13 | Tofu-Wurst kitchen | €40 | 1 | ×1.13 | start |
| Oat | 1.07 | Oat field | €250 | 2 | ×1.034 | €30,000 |
| Oat | 1.07 | Oat mill | €500 | 1.5 | ×1.046 | €30,000 |
| Oat | 1.07 | Café bar | €700 | 1 | ×1.07 | €30,000 |
| Wheat | 1.06 | Wheat field | €400 | 2 | ×1.030 | €140,000 |
| Wheat | 1.06 | Seitan kitchen | €600 | 1.5 | ×1.040 | €140,000 |
| Wheat | 1.06 | Leverkas oven | €900 | 1 | ×1.06 | €200,000 |

#### Scenario: Cost scaling
- **WHEN** the soybean field (€10, set growth 1.13, share 1.5) is bought and the player owns 2
- **THEN** the next one costs €12 (10 × 1.13^(2 ÷ 1.5), about €11.77, rounded up)

#### Scenario: Cost scaling with many copies
- **WHEN** the player owns 24 soybean fields
- **THEN** the next one costs €71 (10 × 1.13^16, about €70.68, rounded up)

#### Scenario: Product building grows per copy
- **WHEN** the player owns 1 tofu press (€25, share 1)
- **THEN** the next one costs €29 (about €28.25, rounded up)

#### Scenario: Slower growth in a later chain
- **WHEN** the player owns 1 wheat field (€400, set growth 1.06, share 2)
- **THEN** the next one costs €412 (about €411.83, rounded up)

#### Scenario: A whole set multiplies every price once
- **WHEN** the player owns 2 wheat fields (one set's share) and 1 Leverkas oven
- **THEN** the next wheat field costs €424 (400 × 1.06) and the next oven €954 (900 × 1.06):
  one set raises every price in the chain by the set growth once

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

## ADDED Requirements

### Requirement: Chain proportions
Every chain SHALL need at least as many buildings of each step as of the step after it, and more
fields than product buildings, when it runs without stalls or surplus at base values (no
upgrades). The proportions SHALL follow from the base rates and recipes, and each building's
share of a balanced set (its count per product building) SHALL be derived from them, not stored:

| Chain | Field output | Processing (recipe, runs per second) | Product (recipe, runs per second) | Balanced set |
|---|---|---|---|---|
| Soy | 1 soybean/s | 3 soybeans → 1 tofu, 0.5/s | 1 tofu → 1 Tofu-Wurst, 0.5/s | 1.5 : 1 : 1 |
| Oat | 0.5 oats/s | 2 oats → 1 oat drink, 1/3 per s | 1 oat drink → 1 Hafer-Cappuccino, 0.5/s | 2 : 1.5 : 1 |
| Wheat | 0.5 wheat/s | 2 wheat → 1 seitan, 1/3 per s | 2 seitan → 1 Leverkas, 0.25/s | 2 : 1.5 : 1 |

These are starting values; the values the balancing page settles on SHALL replace them here. A
content check SHALL fail the build when any chain breaks the proportion rule or the price order of
the buying requirement. Upgrades MAY shift the proportions during play.

#### Scenario: Soy line
- **WHEN** one Tofu-Wurst kitchen runs at full speed without upgrades
- **THEN** it needs 1 tofu press and 1.5 soybean fields to run without stalls

#### Scenario: Oat line
- **WHEN** one café bar runs at full speed without upgrades
- **THEN** it needs 1.5 oat mills and 2 oat fields to run without stalls

#### Scenario: Wheat line
- **WHEN** one Leverkas oven runs at full speed without upgrades
- **THEN** it needs 1.5 seitan kitchens and 2 wheat fields to run without stalls

#### Scenario: Oat field output
- **WHEN** the player owns 4 oat fields and no upgrades, and 10 seconds pass
- **THEN** the oat stock has grown by 20
