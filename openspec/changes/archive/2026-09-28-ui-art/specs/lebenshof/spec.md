# Spec Delta

## MODIFIED Requirements

### Requirement: Resident list
The Lebenshof tab SHALL list every resident with its species illustration and name, grouped by
species and in rescue order within each species. Each group SHALL show how many animals it has.

#### Scenario: Mixed residents
- **WHEN** the player has rescued 3 chickens and then 1 pig
- **THEN** the list shows a chicken group of 3 names in rescue order and a pig group of 1 name,
  each with its species illustration
