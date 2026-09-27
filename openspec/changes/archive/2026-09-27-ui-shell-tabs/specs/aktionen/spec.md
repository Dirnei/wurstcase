# Spec Delta

## MODIFIED Requirements

### Requirement: Aktionen panel
The Aktionen tab SHALL be locked until the first Aktion is unlocked, and SHALL stay unlocked after
that. Its lock hint SHALL name the total money earned at which the first Aktion unlocks. The tab
SHALL show the awareness pool and one button per unlocked Aktion with its name, awareness cost,
effect and, while cooling down, the seconds left.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €999
- **THEN** the Aktionen tab is locked with the hint that it unlocks at €1K earned

#### Scenario: First Aktion
- **WHEN** the total money earned reaches €1,000
- **THEN** the Aktionen tab can be opened and shows the flyer Aktion
