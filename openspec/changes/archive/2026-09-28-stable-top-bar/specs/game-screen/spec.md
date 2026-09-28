## MODIFIED Requirements

### Requirement: Top bar
The game view SHALL show a top bar on every tab with:
- the game's name
- money
- income per minute
- the DE/EN toggle
- a button that opens the Einstellungen tab

Once the Lebenshof is unlocked, the top bar SHALL also show the awareness pool. The news ticker
SHALL be shown directly below the top bar. The top bar SHALL NOT show the play time.

The top bar SHALL keep a stable layout while the game runs. A value that changes SHALL NOT move,
resize or re-wrap any other element of the top bar:

- Money, income and awareness SHALL each have a slot of its own. The slots SHALL have equal widths
  that come from the top bar's layout, not from the values in them.
- The awareness slot SHALL keep its space before the Lebenshof is unlocked, so money and income do
  not move when awareness appears.
- The values SHALL use the fixed-decimal form of the number format, in digits of equal width.
- The income label SHALL name the unit (per minute), and the income value SHALL show only the
  signed amount.

#### Scenario: Top bar at the start
- **WHEN** a new game starts
- **THEN** the top bar shows €0.0, the income per minute and the DE/EN toggle, and no awareness
  and no play time

#### Scenario: Awareness appears
- **WHEN** the total money earned reaches €100
- **THEN** the top bar also shows the awareness pool, and money and income stay where they were

#### Scenario: Visible on every tab
- **WHEN** the player opens the Verkauf tab and then the Einstellungen tab
- **THEN** the top bar and the news ticker stay visible with the same values

#### Scenario: Money gains a decimal
- **WHEN** the money changes from €37.0 to €37.5, or from €1.20K to €1.23K
- **THEN** the income, the awareness, the language toggle and the settings button do not move

#### Scenario: Money crosses a thousand
- **WHEN** the money changes from €999.9 to €1.00K
- **THEN** no other element of the top bar moves or changes size

#### Scenario: Phone width
- **WHEN** the viewport is 320 px wide and money, income and awareness each show a German value
  in the millions
- **THEN** all three values fit their slots on one line each, and the top bar needs no horizontal
  scrolling

### Requirement: Settings tab
The Einstellungen tab SHALL be always unlocked and SHALL show the DE/EN toggle, saving (export
and import), and the Impressum, Datenschutz and Ko-fi links. The saving section SHALL also show
the play time of the current game.

#### Scenario: Export from settings
- **WHEN** the player opens Einstellungen and chooses export
- **THEN** the save is exported as the save system requires

#### Scenario: Play time in settings
- **WHEN** the player has played for 1 hour and 5 minutes and opens Einstellungen
- **THEN** the saving section shows the play time `1:05:00`, labelled in the selected language,
  and it keeps counting up while the tab is open
