# Spec Delta

## MODIFIED Requirements

### Requirement: Upgrades panel
The Upgrades tab SHALL be locked until the first upgrade is on offer, and SHALL stay unlocked
after that. Its lock hint SHALL name the total money earned at which the first upgrade comes on
offer. The tab SHALL list every upgrade that is on offer and not yet owned, cheapest first. Each
entry SHALL show the upgrade's name, a short joke line, its effect in plain words and its price in
a buy button. Owned upgrades SHALL be listed in a collapsed section with their count.

#### Scenario: Nothing on offer yet
- **WHEN** a new game starts
- **THEN** the Upgrades tab is locked with the hint that it unlocks at €30 earned

#### Scenario: First offer
- **WHEN** the total money earned reaches €30
- **THEN** the Upgrades tab can be opened and shows "strong hands" and its price of €40
