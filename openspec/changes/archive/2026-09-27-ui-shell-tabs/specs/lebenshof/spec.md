# Spec Delta

## MODIFIED Requirements

### Requirement: Lebenshof unlock
The Lebenshof tab SHALL be locked until the total money earned in this game reaches its unlock
threshold (€100). After that it SHALL stay unlocked, even if money is spent. The tab SHALL show
the space in use and the total space.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €99
- **THEN** the Lebenshof tab is locked with the hint that it unlocks at €100 earned

#### Scenario: Unlocked
- **WHEN** the total money earned reaches €100 and the player then spends all their money
- **THEN** the Lebenshof tab can be opened and shows 0 of 0 space in use
