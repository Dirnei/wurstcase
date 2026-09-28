## MODIFIED Requirements

### Requirement: Running an Aktion
The player SHALL be able to run an unlocked Aktion when it is not cooling down and the pool holds at
least its current cost. An Aktion's current cost SHALL be its base cost × its growth for the runs
so far × the counter-event and upgrade cost factors, rounded up to whole points. Running it SHALL
take the current cost from the pool, SHALL start its cooldown, and SHALL add one to its runs. For a
campaign, it SHALL at once convert its base customers × its growth for the runs before this one ×
the counter-event, upgrade and MegaMeat scandal reach factors × (1 − customers ÷ population),
rounded down, and never beyond the population. The scandal reach factor is K ÷ (K + scandal) as
the bulk-sales MegaMeat scandal requirement defines it. Campaigns SHALL be the only way
townspeople become customers. Money SHALL NOT change. The button SHALL be unavailable otherwise,
and SHALL show whether awareness is lacking or how long the cooldown still runs.

#### Scenario: Flyers
- **WHEN** the flyers have not been run yet, there are 10,000 customers, the pool holds 150 and the
  player runs the flyers
- **THEN** there are 10,010 customers, the pool holds 50, and the flyers cool down for 30 seconds

#### Scenario: Second run
- **WHEN** the flyers have been run once, there are 10 customers, the pool holds 200 and the
  player runs the flyers
- **THEN** the pool holds 75 and there are 31 customers

#### Scenario: Cooldown
- **WHEN** the flyers were run 10 seconds ago
- **THEN** the flyer button is unavailable and shows 20 seconds left

#### Scenario: Not enough awareness
- **WHEN** the flyers have not been run yet and the pool holds 99
- **THEN** the flyers cannot be run and the button shows that awareness is lacking

#### Scenario: Nearly full town
- **WHEN** the open farm day has not been run yet, there are 19,000 customers and the player runs
  it
- **THEN** there are 19,015 customers (300 × 5%)

#### Scenario: Never beyond the town
- **WHEN** there are 19,990 customers and the player runs a campaign that would win 50
- **THEN** there are at most 20,000 customers

#### Scenario: Scandal lowers the reach
- **WHEN** the scandal is €10,000, the flyers have not been run yet, there are 10 customers and
  the player runs the flyers
- **THEN** there are 19 customers and the estimate on the button said 9 before the run
