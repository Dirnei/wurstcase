# aktionen Specification

## Purpose

Lets the player spend collected awareness on campaigns that win customers much faster than
passive conversion, and on a fact check that ends MegaMeat's current counter-event.

## Requirements

### Requirement: Aktionen panel
The Aktionen tab SHALL be locked until the first Aktion is unlocked, and SHALL stay unlocked after
that. Its lock hint SHALL name the total money earned at which the first Aktion unlocks. The tab
SHALL show the awareness pool and one button per unlocked Aktion with its name, awareness cost,
effect and, while cooling down, the seconds left.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €999
- **THEN** the Aktionen tab is locked with the hint that it unlocks at €1K earned

#### Scenario: First Aktion
- **WHEN** the total money earned reaches €1,000
- **THEN** the Aktionen tab can be opened and shows the flyer Aktion

### Requirement: Act 1 Aktionen
The game SHALL offer these Aktionen, each once its unlock condition holds:

| Aktion | Unlock | Awareness cost | Base customers | Cooldown |
|---|---|---|---|---|
| Flyer am Wochenmarkt | €1,000 earned | 100 | 20 | 30 s |
| Tag der offenen Hoftür | €5,000 earned | 1,500 | 300 | 120 s |
| Virales Video: Schwein auf der Rutsche | €15,000 earned and at least one pig in the Lebenshof | 6,000 | 1,500 | 300 s |
| Faktencheck | the first counter-event has started | 300 | – | 60 s |

#### Scenario: Viral video needs a pig
- **WHEN** the total money earned is €20,000 and the Lebenshof has chickens and cows but no pig
- **THEN** the viral video is not offered

#### Scenario: Fact check appears with MegaMeat
- **WHEN** the first counter-event starts
- **THEN** the fact check is offered, and it stays offered afterwards

### Requirement: Running an Aktion
The player SHALL be able to run an unlocked Aktion when it is not cooling down and the pool holds at
least its current cost. Running it SHALL take the cost from the pool, SHALL start its cooldown,
and, for a campaign, SHALL at once convert the base customers × (1 − customers ÷ population),
rounded down, and never beyond the population. Money SHALL NOT change. The button SHALL be
unavailable otherwise, and SHALL show whether awareness is lacking or how long the cooldown still
runs.

#### Scenario: Flyers
- **WHEN** there are 10,000 customers, the pool holds 150 and the player runs the flyers
- **THEN** there are 10,010 customers, the pool holds 50, and the flyers cool down for 30 seconds

#### Scenario: Cooldown
- **WHEN** the flyers were run 10 seconds ago
- **THEN** the flyer button is unavailable and shows 20 seconds left

#### Scenario: Not enough awareness
- **WHEN** the pool holds 99
- **THEN** the flyers cannot be run and the button shows that awareness is lacking

#### Scenario: Nearly full town
- **WHEN** there are 19,000 customers and the player runs the open farm day
- **THEN** there are 19,015 customers (300 × 5%)

### Requirement: Fact check
Running the fact check SHALL end the active counter-event at once. It SHALL be unavailable while no
counter-event is active.

#### Scenario: Ending the ad campaign
- **WHEN** the ad campaign has 90 seconds left, the pool holds 400 and the player runs the fact
  check
- **THEN** the campaign ends, awareness counts fully again and the pool holds 100

#### Scenario: Nothing to check
- **WHEN** no counter-event is active
- **THEN** the fact check button is unavailable

### Requirement: Aktionen are saved
The awareness pool, the fraction towards its next point, each Aktion's remaining cooldown and how
often each Aktion has been run SHALL be part of the save. A save from before this change SHALL
load with an empty pool, no cooldowns and no Aktion run.

#### Scenario: Reload during a cooldown
- **WHEN** the open farm day has 100 seconds of cooldown left and the page is reloaded
- **THEN** it still has about 100 seconds left

#### Scenario: Older save
- **WHEN** a save from before this change with 3 chickens and 40 customers is loaded
- **THEN** the game continues with 3 chickens, 40 customers and an empty pool
