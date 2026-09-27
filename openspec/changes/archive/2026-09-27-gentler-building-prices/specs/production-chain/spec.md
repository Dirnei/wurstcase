# Spec Delta

## MODIFIED Requirements

### Requirement: Buying buildings
The player SHALL be able to buy one building at a time when they have enough money. The price
SHALL be the building's base price × 1.10^(number already owned), rounded up to whole euros.
Buying SHALL subtract the price from the money and add one building. A building the player
cannot afford SHALL show its price but SHALL NOT be buyable.

#### Scenario: Cost scaling
- **WHEN** a building has a base price of €10 and the player owns 2
- **THEN** the next one costs €13 (€12.10 rounded up)

#### Scenario: Cost scaling with many copies
- **WHEN** a building has a base price of €10 and the player owns 24
- **THEN** the next one costs €99 (about €98.50, rounded up)

#### Scenario: Loaded save uses the current rate
- **WHEN** a save made under the old 15% rate is loaded with 2 soybean fields
- **THEN** the player keeps both fields, gets no refund, and the next field costs €13

#### Scenario: Buying
- **WHEN** the player has €15 and buys a soybean field costing €10
- **THEN** money is €5 and the player owns 1 soybean field

#### Scenario: Not enough money
- **WHEN** the player has €9 and a soybean field costs €10
- **THEN** the buy button is disabled and nothing changes
