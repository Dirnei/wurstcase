## MODIFIED Requirements

### Requirement: Language toggle
The game SHALL offer a DE/EN toggle in the Einstellungen tab. It SHALL mark the current language.
Switching SHALL update all visible text immediately without reloading the page and without
resetting game time. The choice SHALL be remembered across page reloads.

#### Scenario: Switch while playing
- **WHEN** the player opens Einstellungen while the play-time counter shows 0:01:30 and switches
  from German to English
- **THEN** all visible text changes to English and the counter continues from 0:01:30

#### Scenario: Choice persists
- **WHEN** the player selects English and reloads the page
- **THEN** the game opens in English

#### Scenario: Storage unavailable
- **WHEN** the browser blocks storage (e.g. strict private mode) and the player switches language
- **THEN** the switch still works for the current visit and no error is shown

#### Scenario: Not in the top bar
- **WHEN** the player is on any tab
- **THEN** the top bar shows no language toggle
