# Spec Delta

## Purpose

Makes the game feel alive and responsive with subtle motion: drifting clouds, animals that blink
and hop, and short reactions to purchases, sales and tab switches. The motion never gets in the
way and stops for players who ask for reduced motion.

## ADDED Requirements

### Requirement: Drifting clouds
The clouds in the landscape SHALL drift slowly and continuously across the sky. Each cloud SHALL
take between 60 and 120 seconds to cross, and the clouds SHALL NOT move in step with each other.

#### Scenario: Clouds move
- **WHEN** the game view has been open for 10 seconds
- **THEN** each cloud has moved a little, and no two clouds are at the same point of their
  motion

### Requirement: Animals idle in the farm scene
Every animal in the farm scene SHALL blink every few seconds and now and then hop. Animals SHALL
NOT blink or hop in sync with each other. An animal's idle motion SHALL NOT move it away from its
place in the scene.

#### Scenario: Not in sync
- **WHEN** the farm scene shows 5 chickens for 10 seconds
- **THEN** the chickens blink at different moments, and each returns to its own place after a hop

### Requirement: Purchase feedback
When the player buys a building, upgrade, shelter or animal, the card or entry they bought from
SHALL react with a short pop that is over within 300 ms. A bought upgrade leaves the offers at once,
so the owned-upgrades section SHALL pop instead. The pop SHALL NOT change the size or position of
anything around it.

#### Scenario: Buy a field
- **WHEN** the player buys a soybean field
- **THEN** the soybean field card pops once, and the other cards do not move

#### Scenario: Buy an upgrade
- **WHEN** the player buys "strong hands"
- **THEN** its card leaves the offers and the owned-upgrades section pops once

#### Scenario: Failed purchase
- **WHEN** the player chooses a Buy button they cannot afford
- **THEN** nothing pops

### Requirement: Sale feedback
When the player sells with the Sell button, the amount earned SHALL float up from the button as
"+€" and the amount, in the selected language's number format, and SHALL fade out within about
one second. At most 5 amounts SHALL float at once. A newer sale beyond that SHALL replace the
oldest one.

#### Scenario: One sale
- **WHEN** the player sells and earns €70
- **THEN** "+€70" floats up from the Sell button and is gone after about one second

#### Scenario: Rapid selling
- **WHEN** the player sells 10 times within one second
- **THEN** no more than 5 amounts are floating at any moment

### Requirement: Tab cross-fade
When the player switches tabs, the new tab's content SHALL fade in within 200 ms. The old content
SHALL disappear at once, so the two never show together, and nothing SHALL slide.

#### Scenario: Switch to Verkauf
- **WHEN** the player chooses the Verkauf tab
- **THEN** the Verkauf content fades in, and the Produktion content is gone at once

### Requirement: Motion never gets in the way
Animations SHALL only move, scale or fade elements and SHALL NOT change the layout. No animation
SHALL delay or block a click, and every control SHALL work while an animation runs. A new
animation on an element SHALL replace one that is still running on it.

#### Scenario: Click during a pop
- **WHEN** the player clicks Buy on a card twice within 100 ms and can afford both
- **THEN** both purchases happen, and the card pops once for the latest click

### Requirement: Reduced motion
When the system asks for reduced motion:
- the clouds and the animals SHALL stand still
- the purchase pop and the tab cross-fade SHALL be off
- instead of the floating amount, the money value in the top bar SHALL briefly highlight, with no
  movement

A change of the preference SHALL take effect without a reload.

#### Scenario: Reduced motion on
- **WHEN** reduced motion is on and the player sells for €70
- **THEN** no amount floats, the money value highlights briefly, and the clouds and animals stand
  still
