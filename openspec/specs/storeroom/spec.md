# storeroom Specification

## Purpose
Limits how much of each good the player can keep, and lets them expand that room level by level,
so surplus has a consequence and the storeroom becomes one more thing to upgrade.

## Requirements

### Requirement: Room per good
The game SHALL have a storeroom with a level, starting at level 1 in a new game. The storeroom
SHALL hold the same room for every resource: 500 units at level 1, doubling with every level
(level n holds 500 × 2^(n−1) units). The room SHALL limit stock only; money, awareness, customers
and open orders SHALL have no cap.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** the storeroom is at level 1 and holds 500 units of each resource

#### Scenario: Level 4
- **WHEN** the storeroom is at level 4
- **THEN** it holds 4,000 units of each resource

#### Scenario: Money is not capped
- **WHEN** the storeroom is at level 1 and the player has €10,000
- **THEN** the money stays €10,000

### Requirement: Expanding the storeroom
The player SHALL be able to expand the storeroom by one level at a time when they have enough
money, as often as they like. The price SHALL be €100 × 3^(level − 1), rounded up to whole euros.
Expanding SHALL subtract the price from the money and raise the level by one. An expansion the
player cannot afford SHALL show its price but SHALL NOT be possible.

These values were checked on the balancing page: with them, the 60-minute default and MegaMeat
simulations keep every pacing milestone's status and the MegaMeat run's customer loss.

#### Scenario: First expansion
- **WHEN** the storeroom is at level 1, the player has €150 and expands it
- **THEN** the storeroom is at level 2, holds 1,000 units of each resource, and the money is €50

#### Scenario: Rising price
- **WHEN** the storeroom is at level 3
- **THEN** the next expansion costs €900

#### Scenario: Not enough money
- **WHEN** the next expansion costs €300 and the player has €299
- **THEN** the Expand button shows €300, is disabled, and expanding changes nothing

### Requirement: Full goods
A resource SHALL count as full while its stock is at or above the storeroom's room. Nothing SHALL
ever remove stock because of the room: stock above the room, for example from a save made before
the storeroom existed, SHALL be kept, and only production into that resource SHALL wait.

While any building waits because its output is full, or while the stock is at or above the room,
the game SHALL mark that resource as full. The mark SHALL stay until the resource has been below
the room and no building has waited on it for 3 seconds of game time, so a stock that hovers at the
room does not flicker.

#### Scenario: Stock reaches the room
- **WHEN** the soybean stock reaches 500 at storeroom level 1
- **THEN** soybeans are marked as full

#### Scenario: Selling frees room
- **WHEN** soybeans are full and the player sells 70 soybeans to the biogas plant
- **THEN** the soybean fields produce again, and the full mark goes away 3 seconds after they last
  waited

#### Scenario: Older stock is kept
- **WHEN** a save with 2,000 Tofu-Wurst is loaded at storeroom level 1
- **THEN** the stock is still 2,000 Tofu-Wurst, Tofu-Wurst is marked as full, and the Tofu-Wurst
  kitchens wait until the stock is below 500

### Requirement: Storeroom is saved
The storeroom level SHALL be part of the save and SHALL be restored exactly. A save from before
the storeroom existed SHALL load with the storeroom at level 1. The full mark SHALL NOT be saved;
after loading, it follows from the stock and the next ticks. Starting a new game SHALL reset the
storeroom to level 1.

#### Scenario: Reload
- **WHEN** the storeroom is at level 5 and the player reloads the page
- **THEN** the storeroom is still at level 5

#### Scenario: Older save
- **WHEN** a save from before the storeroom existed is loaded
- **THEN** the storeroom is at level 1 and every stock is as it was saved

#### Scenario: New game
- **WHEN** the storeroom is at level 5 and the player starts a new game
- **THEN** the storeroom is at level 1
