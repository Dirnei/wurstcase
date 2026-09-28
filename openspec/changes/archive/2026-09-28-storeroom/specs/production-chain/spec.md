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

A manual action SHALL make only as many units as fit in the storeroom's room for its output, and
SHALL use input only for those units. A manual action whose output is full SHALL be unavailable
and SHALL change nothing.

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

#### Scenario: Full output
- **WHEN** the storeroom holds 500 of each good and there are 500 soybeans
- **THEN** "harvest soybeans" is unavailable and clicking it changes no stock

#### Scenario: Click fills the last room
- **WHEN** a click makes 2 soybeans, the storeroom holds 500 and there are 499 soybeans
- **THEN** the click makes 1 soybean and the stock is 500

### Requirement: Stalls
A processing building or kitchen SHALL complete a unit only when the whole input for that unit is
in stock, and it never lets stock go negative. A building whose next unit is ready but lacks
input SHALL wait with that unit ready, without building up further progress, and SHALL complete
it as soon as the input is there. While any building waits for an input, the game SHALL mark
that input's stock as short (shown in red). The mark SHALL stay until no building has waited for
that input for 3 seconds of game time, so a brief or recurring shortage does not flicker.

Every building, fields included, SHALL complete a run only when the run's whole output fits in the
storeroom's room for that resource. A building whose next run does not fit SHALL wait in the same
way: with the unit ready, without building up further progress and without using input, and SHALL
complete it as soon as there is room. Its output SHALL then be marked as full as the storeroom
requires.

#### Scenario: Input runs out
- **WHEN** the player owns 1 tofu press and no soybean field, and the soybean stock is 0
- **THEN** no tofu is produced and the soybean stock is marked as short

#### Scenario: Not enough for a whole unit
- **WHEN** a tofu press has its next tofu ready and there are 2 soybeans in stock
- **THEN** no tofu is made, the 2 soybeans stay in stock, and the soybean stock is marked as short

#### Scenario: Recurring shortage does not flicker
- **WHEN** one soybean field feeds a tofu press, so the press alternates between waiting for
  soybeans and pressing
- **THEN** the soybean stock stays marked as short the whole time

#### Scenario: No banked progress
- **WHEN** a tofu press has waited for 60 seconds and then 30 soybeans arrive at once
- **THEN** it makes 1 tofu right away and the rest at its normal rate, not 30 tofu at once

#### Scenario: Supply returns
- **WHEN** a waiting tofu press receives enough soybeans for its full rate again
- **THEN** the soybean stock stops being marked as short 3 seconds after the press last waited

#### Scenario: Output full
- **WHEN** the storeroom holds 500 of each good, there are 500 tofu and 30 soybeans, and a tofu
  press has its next tofu ready
- **THEN** no tofu is made, the 30 soybeans stay in stock, and tofu is marked as full

#### Scenario: Run does not overshoot
- **WHEN** a tofu press makes 2 tofu per run, the storeroom holds 500 and there are 499 tofu
- **THEN** the press waits and the tofu stock stays 499

#### Scenario: Field stops at the room
- **WHEN** 3 soybean fields run for 1,000 seconds with nothing using soybeans at storeroom level 1
- **THEN** the soybean stock is 500
