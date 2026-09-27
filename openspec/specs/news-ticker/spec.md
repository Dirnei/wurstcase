# news-ticker Specification

## Purpose

Gives the game its satirical voice and its tutorial: one news headline at a time, with MegaMeat
breaking news and hints that point new players to their next step.

## Requirements

### Requirement: Ticker line
The game view SHALL show a news ticker line below the header with one headline at a time, in the
current language. The headline SHALL change every 15 seconds. The ticker SHALL announce new
headlines politely to screen readers and SHALL NOT scroll text sideways.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** the ticker shows a headline

#### Scenario: Rotation
- **WHEN** 15 seconds pass
- **THEN** the ticker shows the next headline

### Requirement: Satirical headlines
The game SHALL have at least 12 satirical headlines in German and English, each with a total
earnings threshold from which it can appear. A headline SHALL NOT repeat within the next 3
satirical headlines while enough other headlines are available.

#### Scenario: Early game
- **WHEN** a new game starts
- **THEN** only headlines with a threshold of €0 can appear

#### Scenario: No quick repeats
- **WHEN** at least 4 satirical headlines are available and 4 are shown in a row
- **THEN** all 4 are different

### Requirement: Breaking news
When a counter-event starts, the ticker SHALL show that event's breaking-news headline at once,
without waiting for the rotation, and keep it for a full 15 seconds.

#### Scenario: Ad campaign starts
- **WHEN** the ad campaign starts while another headline has been shown for 5 seconds
- **THEN** the ticker switches to the ad campaign's breaking news right away

### Requirement: Tutorial hints
The game SHALL have tutorial hints written as headlines, each with a condition on the game state.
While at least one hint's condition holds, every other headline SHALL be a hint. The first hint in
list order whose condition holds SHALL be shown, and a hint shown last time SHALL be skipped if
another one applies. The Act 1 hints and their conditions:

| Hint | Shown while |
|---|---|
| A field would beat harvesting by hand | no soybean field is owned |
| A press would make tofu faster | a soybean field but no tofu press is owned |
| Someone should sell while you work | the shop assistant is offered but not hired |
| Animals need a home | the Lebenshof is unlocked and has no residents |
| Wheat is in fashion | the wheat field is unlocked but none is owned |
| Flyers could win the market | the flyers are unlocked and have never been run |
| A fact check would help | a counter-event is active and the fact check can be run |
| Upgrades are on offer | an upgrade is on offer and none is owned |

#### Scenario: First hint
- **WHEN** a new game starts
- **THEN** within the first two headlines the ticker shows the soybean field hint

#### Scenario: Hint disappears
- **WHEN** the player buys the first soybean field
- **THEN** the soybean field hint is no longer shown

#### Scenario: No hints apply
- **WHEN** no hint's condition holds
- **THEN** every headline is satirical

#### Scenario: Upgrade hint
- **WHEN** "strong hands" is on offer and no upgrade is owned
- **THEN** the upgrades hint can appear, and it stops once the first upgrade is bought
