## MODIFIED Requirements

### Requirement: Aktionen panel
The Aktionen tab SHALL be locked until the first Aktion is unlocked, and SHALL stay unlocked after
that. Its lock hint SHALL name the total money earned at which the first Aktion unlocks. The tab
SHALL show the awareness pool and one button per unlocked Aktion with its name, current awareness
cost, current effect (for a campaign: the customers it would win now) and, while cooling down, the
seconds left.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €99
- **THEN** the Aktionen tab is locked with the hint that it unlocks at €100 earned

#### Scenario: First Aktion
- **WHEN** the total money earned reaches €100
- **THEN** the Aktionen tab can be opened and shows the flyer Aktion

#### Scenario: Next run shown
- **WHEN** the flyers have just been run for the first time with 10 customers
- **THEN** the flyer button shows the cost of the second run, 125, and about 21 customers

### Requirement: Act 1 Aktionen
The game SHALL offer these Aktionen, each once its unlock condition holds:

| Aktion | Unlock | Base awareness cost | Base customers | Cooldown |
|---|---|---|---|---|
| Flyer am Wochenmarkt | €100 earned | 100 | 20 | 30 s |
| Tag der offenen Hoftür | €5,000 earned | 1,500 | 300 | 120 s |
| Virales Video: Schwein auf der Rutsche | €15,000 earned and at least one pig in the Lebenshof | 6,000 | 1,500 | 300 s |
| Faktencheck | the first counter-event has started | 300 | – | 60 s |

Every campaign (every Aktion that wins customers) SHALL grow with each run: for every time it has
been run in this game, its cost SHALL be multiplied by 1.25 and its customers by 1.1. The cost
grows faster than the reach, so each campaign wins fewer customers per awareness point run by run.
The fact check SHALL NOT grow. These values come from the balancing page: with them, the default
60-minute simulation passes 80% of the town between 35 and 60 minutes, and the MegaMeat run ends
with less than half its customers.

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

#### Scenario: Fact check stays the same
- **WHEN** the fact check has been run 5 times
- **THEN** it still costs 300 awareness

### Requirement: Running an Aktion
The player SHALL be able to run an unlocked Aktion when it is not cooling down and the pool holds at
least its current cost. An Aktion's current cost SHALL be its base cost × its growth for the runs
so far × the counter-event and upgrade cost factors, rounded up to whole points. Running it SHALL
take the current cost from the pool, SHALL start its cooldown, and SHALL add one to its runs. For a
campaign, it SHALL at once convert its base customers × its growth for the runs before this one ×
the counter-event and upgrade reach factors × (1 − customers ÷ population), rounded down, and never
beyond the population. Campaigns SHALL be the only way townspeople become customers. Money SHALL
NOT change. The button SHALL be unavailable otherwise, and SHALL show whether awareness is lacking
or how long the cooldown still runs.

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
