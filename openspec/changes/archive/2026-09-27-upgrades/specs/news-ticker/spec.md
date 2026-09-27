# Spec Delta

## MODIFIED Requirements

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
