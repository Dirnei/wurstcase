## MODIFIED Requirements

### Requirement: Settings tab
The Einstellungen tab SHALL be always unlocked and SHALL show the DE/EN toggle, the theme choice,
saving (export and import), and the Impressum, Datenschutz and Ko-fi links. The saving section SHALL
also show the play time of the current game.

The theme choice SHALL offer System, Light and Dark, labelled in the selected language, and SHALL
mark the current choice. Choosing an option SHALL take effect at once, without a reload.

#### Scenario: Export from settings
- **WHEN** the player opens Einstellungen and chooses export
- **THEN** the save is exported as the save system requires

#### Scenario: Play time in settings
- **WHEN** the player has played for 1 hour and 5 minutes and opens Einstellungen
- **THEN** the saving section shows the play time `1:05:00`, labelled in the selected language,
  and it keeps counting up while the tab is open

#### Scenario: Choose dark
- **WHEN** the system uses a light colour scheme and the player chooses Dark in Einstellungen
- **THEN** the game switches to dark parchment and the dusk landscape at once, and Dark is marked
  as the current choice

#### Scenario: Default choice
- **WHEN** a player opens Einstellungen for the first time
- **THEN** System is marked as the current choice

### Requirement: Paper look in light and dark
The game view SHALL use the storybook paper look: paper panels with ink outlines. It SHALL show
light paper in the light theme and dark parchment in the dark theme. The theme in effect SHALL be
the player's choice of Light or Dark; with System, which is the default, it SHALL follow the
system's colour scheme and change with it while the game is open.

The choice SHALL be kept in the browser across visits, apart from the save, so starting a new game
or importing a save SHALL NOT change it. When the browser blocks storage, the choice SHALL last
for the current visit. After a reload, the first painted frame SHALL already use the theme in
effect.

In both themes:
- normal text SHALL have a contrast of at least 4.5:1 against its background
- outlines of controls SHALL have a contrast of at least 3:1
- keyboard focus SHALL be visibly marked

#### Scenario: Dark mode
- **WHEN** the system uses a dark colour scheme and the theme choice is System
- **THEN** the game shows dark parchment panels with light text that meets the contrast minimum

#### Scenario: Light choice on a dark system
- **WHEN** the system uses a dark colour scheme and the player has chosen Light
- **THEN** the game shows light paper panels and the day landscape

#### Scenario: System follows live
- **WHEN** the theme choice is System and the system switches from light to dark while the game
  is open
- **THEN** the game switches to dark parchment without a reload

#### Scenario: Explicit choice ignores the system
- **WHEN** the player has chosen Light and the system switches to dark
- **THEN** the game stays light

#### Scenario: Choice survives a reload
- **WHEN** the player chose Dark on a light system and reloads the page
- **THEN** the game opens in the dark theme, with no light frame shown first

#### Scenario: New game keeps the theme
- **WHEN** the player has chosen Dark and starts a new game
- **THEN** the game stays dark and Dark stays marked
