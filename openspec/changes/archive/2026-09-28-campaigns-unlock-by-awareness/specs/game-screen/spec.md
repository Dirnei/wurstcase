## MODIFIED Requirements

### Requirement: Locked tabs
The Upgrades, Lebenshof and Aktionen tabs SHALL be locked until their content unlocks. A locked
tab SHALL stay visible in the tab strip, dimmed and marked as locked, and SHALL NOT open. It SHALL
show, as visible text and for screen readers, what unlocks it: for the Upgrades and Lebenshof tabs
the total money earned at which it unlocks, for the Aktionen tab the awareness it needs. Once
unlocked, a tab SHALL stay unlocked for the rest of the game.

#### Scenario: Locked Lebenshof
- **WHEN** a new game starts
- **THEN** the Lebenshof tab is shown locked with the hint that it unlocks at €100 earned, and
  choosing it keeps the current tab

#### Scenario: Tab unlocks
- **WHEN** the total money earned reaches €100
- **THEN** the Lebenshof tab can be opened

#### Scenario: Locked Aktionen
- **WHEN** a new game starts and the game is in German
- **THEN** the Aktionen tab is shown locked with the hint "ab 50 Aufmerksamkeit"
