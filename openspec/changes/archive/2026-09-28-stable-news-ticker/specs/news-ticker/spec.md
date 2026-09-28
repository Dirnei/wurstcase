## MODIFIED Requirements

### Requirement: Ticker line
The game view SHALL show a news ticker line below the header with one headline at a time, in the
current language. The headline SHALL change every 15 seconds. The ticker SHALL announce new
headlines politely to screen readers and SHALL NOT scroll text sideways.

The ticker SHALL keep one height while headlines change: at every viewport width, its height SHALL
be that of the tallest headline in the current language, so a new headline never moves or resizes
anything below it. Headlines SHALL be shown in full, never clipped or cut off with an ellipsis. No
headline SHALL be longer than 100 characters in either language, so the reserved height stays small
on phones. The height MAY change when the language or the viewport width changes.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** the ticker shows a headline

#### Scenario: Rotation
- **WHEN** 15 seconds pass
- **THEN** the ticker shows the next headline

#### Scenario: Headlines of different length on a phone
- **WHEN** the viewport is 320 px wide and the ticker changes from a one-line headline to the
  longest German headline
- **THEN** the ticker's height does not change, the whole headline is readable, and the Verkauf
  tab below does not move

#### Scenario: Breaking news keeps the height
- **WHEN** a counter-event's breaking news replaces a short headline
- **THEN** the ticker's height does not change

#### Scenario: Short headlines everywhere
- **WHEN** the headline texts are checked
- **THEN** none is longer than 100 characters in German or English
