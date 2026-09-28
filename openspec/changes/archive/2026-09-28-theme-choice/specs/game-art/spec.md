## MODIFIED Requirements

### Requirement: Dusk in dark mode
When the dark theme is in effect, whether chosen by the player or taken from the system's colour
scheme, the landscape SHALL show dusk: a dark evening sky, the moon instead of the sun and lit
farmhouse windows. Every illustration SHALL switch to its dusk colours. In both themes, an
illustration's outlines SHALL have a contrast of at least 3:1 against the panel behind them.

#### Scenario: Evening
- **WHEN** the theme choice is System and the system switches to a dark colour scheme while the
  game is open
- **THEN** the landscape shows the dusk sky, the moon and lit windows, without a reload

#### Scenario: Chosen dusk
- **WHEN** the system uses a light colour scheme and the player chooses Dark
- **THEN** the landscape shows the dusk sky, the moon and lit windows, and every illustration uses
  its dusk colours
