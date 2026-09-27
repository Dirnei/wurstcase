## MODIFIED Requirements

### Requirement: Manual production
The player SHALL be able to do every step of every chain by hand, one unit per click:

- Soy: harvest soybeans (+1 soybean), press tofu (3 soybeans → 1 tofu), make Tofu-Wurst
  (1 tofu → 1 Tofu-Wurst).
- Wheat: harvest wheat (+1 wheat), make seitan (2 wheat → 1 seitan), bake Leverkas
  (2 seitan → 1 Leverkas).
- Oats: harvest oats (+1 oat), make oat drink (2 oats → 1 oat drink), make Hafer-Cappuccino
  (1 oat drink → 1 Hafer-Cappuccino).

Each manual action SHALL use the same input ratio as the building that does the same step. A
manual action SHALL be available only once the building for the same step is unlocked, and SHALL
be hidden while it is locked. A manual action that is locked or lacks its input SHALL change
nothing. Manual actions SHALL be shown grouped by chain.

#### Scenario: Harvesting
- **WHEN** the player clicks "harvest soybeans" 3 times
- **THEN** the soybean stock is 3

#### Scenario: Pressing by hand
- **WHEN** the player has 3 soybeans and clicks "press tofu"
- **THEN** soybeans are 0 and tofu is 1

#### Scenario: Missing input
- **WHEN** the player has 2 soybeans
- **THEN** "press tofu" is unavailable and clicking it changes no stock

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** only the three soy actions are shown

#### Scenario: Wheat chain by hand
- **WHEN** the wheat field, seitan kitchen and Leverkas oven are unlocked and the player clicks
  "harvest wheat" 4 times, "make seitan" twice and "bake Leverkas" once
- **THEN** wheat is 0, seitan is 0 and Leverkas is 1

#### Scenario: Oat chain by hand
- **WHEN** the oat chain is unlocked and the player clicks "harvest oats" twice, "make oat drink"
  once and "make Hafer-Cappuccino" once
- **THEN** oats are 0, oat drink is 0 and Hafer-Cappuccino is 1

#### Scenario: Step unlocks with its building
- **WHEN** lifetime earnings reach the wheat field's unlock but not the Leverkas oven's
- **THEN** "harvest wheat" and "make seitan" are shown and "bake Leverkas" is hidden

#### Scenario: Locked action changes nothing
- **WHEN** the oat field is still locked and the player somehow triggers "harvest oats"
- **THEN** the oat stock is unchanged
