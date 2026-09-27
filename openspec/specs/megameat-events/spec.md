# megameat-events Specification

## Purpose

Makes MegaMeat Corp push back against the player's campaigns with timed counter-events that slow
the awareness side of the game until they run out or are fact-checked.

## Requirements

### Requirement: When counter-events start
No counter-event SHALL start before the player has run their first Aktion. The first counter-event
SHALL start 60 seconds of game time after that. Each later counter-event SHALL start 5 minutes of
game time after the previous one ended, whether it ran out or was ended by the fact check. At
most one counter-event SHALL be active at a time. Counter-events SHALL depend only on game state
and time, never on chance.

#### Scenario: Quiet before the first campaign
- **WHEN** an hour of game time passes and the player has never run an Aktion
- **THEN** no counter-event has started

#### Scenario: MegaMeat reacts
- **WHEN** the player runs the flyers for the first time and 60 seconds pass
- **THEN** the first counter-event starts

#### Scenario: Pause between events
- **WHEN** a counter-event ends
- **THEN** the next one starts exactly 5 minutes of game time later

### Requirement: Act 1 counter-events
Counter-events SHALL start in this order, starting again from the top after the last:

| Counter-event | Effect | Duration |
|---|---|---|
| Ad campaign "Echte Männer essen Fleisch" | awareness counts half | 120 s |
| A MegaMeat-funded "study" | passive conversion stops | 60 s |
| MegaMeat books every billboard in town | Aktionen cost double | 90 s |

An event SHALL end by itself when its duration has passed.

#### Scenario: Order
- **WHEN** three counter-events have started
- **THEN** they were the ad campaign, the study and the billboards, in that order, and the fourth
  is the ad campaign again

#### Scenario: Billboards
- **WHEN** the billboards event is active
- **THEN** the flyers cost 200 awareness and the fact check costs 600

#### Scenario: Runs out
- **WHEN** the study started 60 seconds ago
- **THEN** it has ended and passive conversion runs again

### Requirement: Counter-event banner
While a counter-event is active, the Aktionen panel SHALL show a banner with its name, a short
satirical description, its effect and the seconds left.

#### Scenario: Active ad campaign
- **WHEN** the ad campaign started 30 seconds ago
- **THEN** the banner names it, says that awareness counts half, and shows 90 seconds left

### Requirement: Counter-events are saved
The active counter-event with its remaining time, the time until the next one and which event
comes next SHALL be part of the save. A save from before this change SHALL load with no active
event and none scheduled.

#### Scenario: Reload during an event
- **WHEN** the study has 40 seconds left and the page is reloaded
- **THEN** the study is still active with about 40 seconds left
