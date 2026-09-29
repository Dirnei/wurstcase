## MODIFIED Requirements

### Requirement: Act 1 Aktionen
The game SHALL offer these Aktionen, each once the Aktionen tab is unlocked and its own unlock
condition holds:

| Aktion | Unlock | Base awareness cost | Base customers | Cooldown |
|---|---|---|---|---|
| Flyer am Wochenmarkt | – (with the tab) | 100 | 20 | 30 s |
| Tag der offenen Hoftür | €5,000 earned | 1,500 | 150 | 120 s |
| Virales Video: Schwein auf der Rutsche | €15,000 earned and at least one pig in the Lebenshof | 6,000 | 750 | 300 s |
| Faktencheck | the first counter-event has started | 300 | – | 60 s |

Every campaign (every Aktion that wins customers) SHALL grow with each run: for every time it has
been run in this game, its cost SHALL be multiplied by 1.25 and its customers by 1.1. The cost
grows faster than the reach, so each campaign wins fewer customers per awareness point run by run.
The fact check SHALL NOT grow. These values are tuned by playtesting.

#### Scenario: Flyers with the tab
- **WHEN** the total money earned is €300 and the pool reaches 50 awareness for the first time
- **THEN** the flyers are offered

#### Scenario: Open farm day needs the tab
- **WHEN** the total money earned is €6,000 and the pool has never held 50 awareness
- **THEN** the open farm day is not offered

#### Scenario: Viral video needs a pig
- **WHEN** the total money earned is €20,000 and the Lebenshof has chickens and cows but no pig
- **THEN** the viral video is not offered

#### Scenario: Fact check appears with MegaMeat
- **WHEN** the first counter-event starts
- **THEN** the fact check is offered, and it stays offered afterwards

#### Scenario: Eighth flyer run
- **WHEN** the flyers have been run 7 times, there are 10 customers and no counter-event or
  upgrade applies
- **THEN** the next flyer run costs 477 awareness and wins 38 customers

#### Scenario: First open farm day
- **WHEN** the open farm day has not been run yet, there are 10 customers and no counter-event,
  upgrade or scandal applies
- **THEN** it wins 149 customers (150 × 0.9995, rounded down), not about 300

#### Scenario: First viral video
- **WHEN** the viral video has not been run yet, there are 10 customers and no counter-event,
  upgrade or scandal applies
- **THEN** it wins 749 customers, not about 1,500

#### Scenario: Fact check stays the same
- **WHEN** the fact check has been run 5 times
- **THEN** it still costs 300 awareness

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
- **THEN** there are 19,007 customers (150 × 5%, rounded down)

#### Scenario: Never beyond the town
- **WHEN** there are 19,990 customers and the player runs a campaign that would win 50
- **THEN** there are at most 20,000 customers

#### Scenario: Scandal lowers the reach
- **WHEN** the scandal is €10,000, the flyers have not been run yet, there are 10 customers and
  the player runs the flyers
- **THEN** there are 19 customers and the estimate on the button said 9 before the run
