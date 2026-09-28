## MODIFIED Requirements

### Requirement: Play-time counter
The game SHALL show the total play time of the current game, labelled in the selected language,
in the saving section of the Einstellungen tab. It continues from the saved play time when the
page loads and starts at 0:00:00 only for a new game. Play time SHALL keep counting while any tab
is open.

#### Scenario: Fresh load
- **WHEN** the page is loaded and no save exists, and the player opens Einstellungen
- **THEN** the counter shows 0:00:00 or a few seconds more and counts up

#### Scenario: Continued game
- **WHEN** the page is loaded and the save contains 1 hour of play time, and the player opens
  Einstellungen
- **THEN** the counter shows 1:00:00 or a few seconds more and continues counting up

#### Scenario: Counting on another tab
- **WHEN** the player spends 2 minutes on the Produktion tab and then opens Einstellungen
- **THEN** the counter includes those 2 minutes
