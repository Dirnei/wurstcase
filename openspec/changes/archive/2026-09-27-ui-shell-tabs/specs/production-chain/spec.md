# Spec Delta

## MODIFIED Requirements

### Requirement: Unlocks
The soy chain SHALL be available from the start. Every other building SHALL become available
once the player's total money earned in this game reaches that building's unlock threshold, and
SHALL stay available after that. Resources nobody has produced yet SHALL not be shown.

Of the locked buildings, those with the lowest unlock threshold SHALL be shown as locked cards
in their chains' places. When several share that threshold, all of them are shown. A locked card
shows the building's name and the total money earned at which it unlocks, and has no Buy or
by-hand button. Every other locked building SHALL not be shown.

#### Scenario: Start of the game
- **WHEN** a new game starts
- **THEN** the soybean field, tofu press and Tofu-Wurst kitchen are shown, and the wheat field
  and seitan kitchen are shown locked with "€200 earned"

#### Scenario: Wheat chain unlocks
- **WHEN** the total money earned reaches €200
- **THEN** the wheat field and seitan kitchen are shown and can be bought, and the Leverkas oven
  is shown locked with "€1.5K earned"

#### Scenario: Spending does not relock
- **WHEN** a building is unlocked and the player then spends money below its threshold
- **THEN** the building stays available

#### Scenario: Everything unlocked
- **WHEN** all 9 buildings are unlocked
- **THEN** no locked card is shown
