## MODIFIED Requirements

### Requirement: Aktionen panel
The Aktionen tab SHALL be locked until the awareness pool reaches 50 points for the first time in
this game, and SHALL stay unlocked after that, even when the pool drops below 50 again. Its lock
hint SHALL name the 50 awareness it needs. The tab
SHALL show the awareness pool and one button per unlocked Aktion with its name, current awareness
cost, current effect (for a campaign: the customers it would win now) and, while cooling down, the
seconds left.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €500 and the pool holds 49 awareness
- **THEN** the Aktionen tab is locked with the hint that it unlocks at 50 awareness

#### Scenario: First Aktion
- **WHEN** the pool reaches 50 awareness
- **THEN** the Aktionen tab can be opened and shows the flyer Aktion

#### Scenario: Stays unlocked
- **WHEN** the tab was unlocked at 50 awareness and a MegaMeat bulk sale drops the pool to 20
- **THEN** the Aktionen tab can still be opened and shows the flyers, which lack awareness

#### Scenario: Next run shown
- **WHEN** the flyers have just been run for the first time with 10 customers
- **THEN** the flyer button shows the cost of the second run, 125, and about 21 customers

### Requirement: Act 1 Aktionen
The game SHALL offer these Aktionen, each once the Aktionen tab is unlocked and its own unlock
condition holds:

| Aktion | Unlock | Base awareness cost | Base customers | Cooldown |
|---|---|---|---|---|
| Flyer am Wochenmarkt | – (with the tab) | 100 | 20 | 30 s |
| Tag der offenen Hoftür | €5,000 earned | 1,500 | 300 | 120 s |
| Virales Video: Schwein auf der Rutsche | €15,000 earned and at least one pig in the Lebenshof | 6,000 | 1,500 | 300 s |
| Faktencheck | the first counter-event has started | 300 | – | 60 s |

Every campaign (every Aktion that wins customers) SHALL grow with each run: for every time it has
been run in this game, its cost SHALL be multiplied by 1.25 and its customers by 1.1. The cost
grows faster than the reach, so each campaign wins fewer customers per awareness point run by run.
The fact check SHALL NOT grow. These values come from the balancing page: with them, the default
60-minute simulation passes 80% of the town between 35 and 60 minutes, and the MegaMeat run ends
with less than half its customers.

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

#### Scenario: Fact check stays the same
- **WHEN** the fact check has been run 5 times
- **THEN** it still costs 300 awareness

### Requirement: Aktionen are saved
The awareness pool, the fraction towards its next point, each Aktion's remaining cooldown, how
often each Aktion has been run and whether the Aktionen tab has been unlocked SHALL be part of the
save. A save from before the Aktionen existed SHALL load with an empty pool, no cooldowns, no Aktion
run and the tab locked. A save from before the awareness unlock SHALL load with the tab unlocked
when any Aktion has been run, the pool holds at least 50, or the total money earned is at least
€100, so no player loses a tab they already had.

#### Scenario: Reload during a cooldown
- **WHEN** the open farm day has 100 seconds of cooldown left and the page is reloaded
- **THEN** it still has about 100 seconds left

#### Scenario: Older save
- **WHEN** a save from before the Aktionen existed with 3 chickens and 40 customers is loaded
- **THEN** the game continues with 3 chickens, 40 customers, an empty pool and the Aktionen tab
  locked

#### Scenario: Unlock survives a reload
- **WHEN** the tab was unlocked, the pool now holds 10 and the page is reloaded
- **THEN** the Aktionen tab is still unlocked

#### Scenario: Save from before the awareness unlock
- **WHEN** a save from before this change with €2,000 earned and a pool of 0 is loaded
- **THEN** the Aktionen tab is unlocked
