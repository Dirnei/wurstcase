# Spec Delta

## MODIFIED Requirements

### Requirement: Counter-event banner
While a counter-event is active, the game view SHALL show a banner above the tabs, visible on
every tab, with the event's name, a short satirical description, its effect and the seconds left.
When the fact check can be run, the banner SHALL offer a way to the Aktionen tab.

#### Scenario: Active ad campaign
- **WHEN** the ad campaign started 30 seconds ago
- **THEN** the banner names it, says that awareness counts half, and shows 90 seconds left

#### Scenario: Banner on another tab
- **WHEN** a counter-event starts while the player is on the Produktion tab
- **THEN** the banner is shown above the Produktion tab

#### Scenario: Way to the fact check
- **WHEN** a counter-event is active and the fact check can be run
- **THEN** the banner offers a link that opens the Aktionen tab
