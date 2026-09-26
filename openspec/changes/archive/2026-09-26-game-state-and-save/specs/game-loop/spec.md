# Spec Delta

## MODIFIED Requirements

### Requirement: Play-time counter
The game SHALL show the total play time of the current game, labelled in the selected language.
It continues from the saved play time when the page loads and starts at 0:00:00 only for a new
game.

#### Scenario: Fresh load
- **WHEN** the page is loaded and no save exists
- **THEN** the counter shows 0:00:00 and starts counting up

#### Scenario: Continued game
- **WHEN** the page is loaded and the save contains 1 hour of play time
- **THEN** the counter shows 1:00:00 and continues counting up
