## MODIFIED Requirements

### Requirement: Top bar
The game view SHALL show a top bar on every tab with:
- the game's name
- money
- income per minute

Once the Lebenshof is unlocked, the top bar SHALL also show the awareness pool. The news ticker
SHALL be shown directly below the top bar. The top bar SHALL NOT show the play time, the language
toggle or a button that opens the Einstellungen tab.

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
- **THEN** the top bar shows the game's name, €0.0 and the income per minute, and no awareness,
  no play time, no language toggle and no settings button

#### Scenario: Awareness appears
- **WHEN** the total money earned reaches €100
- **THEN** the top bar also shows the awareness pool, and money and income stay where they were

#### Scenario: Visible on every tab
- **WHEN** the player opens the Verkauf tab and then the Einstellungen tab
- **THEN** the top bar and the news ticker stay visible with the same values

#### Scenario: Money gains a decimal
- **WHEN** the money changes from €37.0 to €37.5, or from €1.20K to €1.23K
- **THEN** the income and the awareness do not move

#### Scenario: Money crosses a thousand
- **WHEN** the money changes from €999.9 to €1.00K
- **THEN** no other element of the top bar moves or changes size

#### Scenario: Phone width
- **WHEN** the viewport is 320 px wide and money, income and awareness each show a German value
  in the millions
- **THEN** all three values fit their slots on one line each, and the top bar needs no horizontal
  scrolling

### Requirement: Small screens
Below 1024 px width:
- the rail SHALL become compact, with amounts and marks and without resource names
- the tab strip SHALL still show every tab, Einstellungen included

Below 768 px width:
- the tabs SHALL move to a bar at the bottom of the screen, each tab with an icon and a label,
  Einstellungen included
- the rail SHALL become a strip that shows money and the Sell button
- a control SHALL open the full stock and close it again

At every width down to 320 px, nothing SHALL need horizontal scrolling, and every button SHALL be
at least 44 × 44 px on screens below 768 px.

#### Scenario: Phone layout
- **WHEN** the viewport is 375 × 667 px
- **THEN** the tabs are at the bottom, the Sell button is visible, and no content needs
  horizontal scrolling

#### Scenario: Stock drawer
- **WHEN** the viewport is 375 px wide and the player opens the stock
- **THEN** every shown resource is listed with its amount and trend mark, and the player can close
  it again

#### Scenario: Settings on a tablet
- **WHEN** the viewport is 900 px wide
- **THEN** the tab strip shows Einstellungen as its last tab, and choosing it opens the tab

#### Scenario: Settings on a phone
- **WHEN** the viewport is 320 px wide
- **THEN** the bottom bar shows six tabs, Einstellungen last, each at least 44 × 44 px, with
  readable labels and no horizontal scrolling
