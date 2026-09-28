## ADDED Requirements

### Requirement: Manual production feedback
When the player makes something by hand, the units made SHALL float up from the by-hand button as
"+" and the number of units, next to the output's illustration, and SHALL fade out within about
one second. At most 5 amounts SHALL float per button at once; a newer click beyond that SHALL
replace the oldest one. A click that makes nothing SHALL float nothing. The float SHALL be drawn
over the card and SHALL NOT change the size or position of anything.

#### Scenario: Harvesting by hand
- **WHEN** the player clicks the by-hand button on the soybean field card
- **THEN** "+1" with the soybean illustration floats up from the button and is gone after about one
  second

#### Scenario: Strong hands
- **WHEN** the player owns "strong hands" and presses tofu by hand with 6 soybeans in stock
- **THEN** "+2" with the tofu illustration floats up

#### Scenario: Rapid clicking
- **WHEN** the player clicks the same by-hand button 10 times within one second
- **THEN** no more than 5 amounts float from that button at any moment, and no card moves

## MODIFIED Requirements

### Requirement: Reduced motion
When the system asks for reduced motion:
- the clouds and the animals SHALL stand still
- the purchase pop and the tab cross-fade SHALL be off
- instead of the floating sale amount, the money value in the top bar SHALL briefly highlight,
  with no movement
- instead of the floating manual amount, the stock figure on the card SHALL briefly highlight, with
  no movement

A change of the preference SHALL take effect without a reload.

#### Scenario: Reduced motion on
- **WHEN** reduced motion is on and the player sells for €70
- **THEN** no amount floats, the money value highlights briefly, and the clouds and animals stand
  still

#### Scenario: Reduced motion by hand
- **WHEN** reduced motion is on and the player harvests soybeans by hand
- **THEN** no amount floats and the soybean field card's stock figure highlights briefly
