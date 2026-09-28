## MODIFIED Requirements

### Requirement: An illustration for every item
Every building, resource, animal species, shelter type, Aktion, bulk buyer, upgrade effect type
and tab SHALL have its own illustration. The top-bar stats (money, income, awareness), the play
time, the rail's customers and open orders, and the storeroom SHALL have one too. The
illustrations SHALL be shown wherever the item is shown:
- building cards
- the rail
- the sales figures
- shelter, rescue and resident entries
- Aktion cards
- bulk buyer cards
- the tab strip and bottom bar
- the top bar
- the play time on the Einstellungen tab

Each item SHALL use the same illustration everywhere. A build SHALL fail when any item that is
content has no illustration.

#### Scenario: Building card
- **WHEN** the Produktion tab shows the soybean field
- **THEN** its card shows the soybean field illustration

#### Scenario: Same art everywhere
- **WHEN** tofu is shown in the rail and in the tofu press's recipe
- **THEN** both show the same tofu illustration

#### Scenario: Play-time art
- **WHEN** the player opens Einstellungen
- **THEN** the play time is shown with the hourglass illustration

#### Scenario: Storeroom art
- **WHEN** the rail shows the storeroom
- **THEN** it shows the storeroom illustration next to the storeroom's name
