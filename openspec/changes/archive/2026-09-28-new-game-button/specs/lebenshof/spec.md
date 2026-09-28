# Spec Delta

## MODIFIED Requirements

### Requirement: Animals are never lost
No player action and no passage of game time SHALL remove a resident or change its species or
name, except replacing the whole game: starting a new game or importing a save, both after the
player confirms.

#### Scenario: Time passes
- **WHEN** the game advances by 12 hours with 5 residents
- **THEN** the same 5 residents are still there, with the same names

#### Scenario: New game
- **WHEN** the player has 5 residents and confirms a new game
- **THEN** the Lebenshof has no residents
