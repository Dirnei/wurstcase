## MODIFIED Requirements

### Requirement: Upgrades panel
The Upgrades tab SHALL be locked until the first upgrade is on offer, and SHALL stay unlocked
after that. Its lock hint SHALL name the total money earned at which the first upgrade comes on
offer. The tab SHALL list every upgrade that is on offer and not yet owned, cheapest first. Each
entry SHALL show the upgrade's name, a short joke line, its effect in plain words and its price in
a buy button. Owned upgrades SHALL be listed in a collapsed section with their count.

The entries SHALL be cards in a grid. Cards in the same row SHALL have the same height, and each
card's buy button SHALL sit at the bottom of its card, so the buy buttons of a row line up at the
same height. Every buy button SHALL have the same height as the Buy buttons on the Produktion
tab, with its text on one line, however long the card's text is.

#### Scenario: Nothing on offer yet
- **WHEN** a new game starts
- **THEN** the Upgrades tab is locked with the hint that it unlocks at €30 earned

#### Scenario: First offer
- **WHEN** the total money earned reaches €30
- **THEN** the Upgrades tab can be opened and shows "strong hands" and its price of €40

#### Scenario: Buttons line up
- **WHEN** two offers sit side by side and one card's joke line wraps to three lines while the
  other's fits on one
- **THEN** both cards have the same height and both buy buttons are at the same height, at the
  bottom of their cards

#### Scenario: Same height as Produktion
- **WHEN** the player compares a buy button on the Upgrades tab with a Buy button on the
  Produktion tab at the same screen width
- **THEN** both buttons have the same height

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide
- **THEN** each offer card spans the width, and its buy button is 44 px tall and at the bottom of
  the card
