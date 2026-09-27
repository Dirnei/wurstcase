# Spec Delta

## ADDED Requirements

### Requirement: Art sheet
The developer page SHALL show every illustration of the game, grouped by kind, each at every size
the game uses it and labelled with its id. The sheet SHALL show each illustration on light paper
and on dark parchment side by side, and SHALL show the landscape in its day and dusk variants.

#### Scenario: Review the art
- **WHEN** the author opens `#dev`
- **THEN** the art sheet shows the soybean field at every size it is used, in the day and dusk
  colours, labelled `soybeanField`

#### Scenario: New art shows up
- **WHEN** an illustration is changed and the page is reloaded
- **THEN** the art sheet shows the changed illustration
