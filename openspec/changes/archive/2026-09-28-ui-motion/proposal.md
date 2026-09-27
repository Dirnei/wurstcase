# Proposal: ui-motion

## Why

After `ui-shell-tabs` and `ui-art` the game looks like a storybook, but it sits still: clicks
change numbers with no sense of cause and effect, and the Lebenshof animals are frozen pictures.
Other idle games feel good because every purchase and sale answers with a small, readable
reaction, and the world around the numbers feels alive. This change adds that, kept subtle as
agreed. Motion never gets in the way, and everything decorative switches off for players who ask
for reduced motion.

This is the third of the three UI changes (`ui-shell-tabs`, `ui-art`, `ui-motion`). None of them
was foreseen in the planned change sequence in section 8 of the concept doc. They sit between #8
`upgrades` (done) and #9 `faktenbuch`.

## What Changes

- **Living background**: the clouds in the landscape drift slowly across the sky.
- **Living Lebenshof**: the animals in the farm scene blink and now and then hop, each on its own
  rhythm, so they never move in sync.
- **Purchase feedback**: buying a building, upgrade, shelter or animal gives the card a short
  "pop".
- **Sale feedback**: selling with the Sell button makes a "+€70" float up from the button and
  fade out.
- **Tab switch**: the tab content cross-fades in quickly, without sliding.
- **Shared motion tokens**: one set of durations and easings for all of the above.
- **Reduced motion**: when the system asks for reduced motion:
  - the clouds and animals stand still
  - the pop and the cross-fade are off
  - the floating "+€70" becomes a brief highlight of the money value, with no movement
- **Guardrails**:
  - animations only move and fade, and never shift the layout
  - they never block a click
  - fast repeated clicks never pile up more than a few floating amounts

## Capabilities

### New Capabilities
- `game-motion`: covers the ambient motion (clouds, animals), the purchase and sale feedback, the
  tab cross-fade, and the reduced-motion and non-blocking rules.

### Modified Capabilities
<!-- None: the building progress bars and all other behaviour stay as they are. -->

## Non-goals

- **Lively extras**: animated buildings (turning mill, steaming oven, swaying crops), coins
  flying to the money counter, and animals walking around the scene. Option 3 in brainstorming;
  not chosen.
- **Floating amounts for the shop assistant's automatic sales and for bulk sales.** They would
  float constantly, or duplicate the rail.
- **Sound and haptics.**
- **Changes to the production bars**, which already animate through the game state.
- **An in-game motion setting.** The system's reduced-motion preference is the switch. A game
  setting can follow in #12 `settings-and-debug`.

## Impact

- **UI code**:
  - New `src/ui/motion/` with the motion tokens (CSS custom properties in `app.css`) and a
    small Svelte action for the purchase pop.
  - `FloatingAmount.svelte` for the sale float.
  - A pure helper that caps and expires the floats, with a unit test.
  - CSS keyframes on the named parts from `ui-art` (`part-cloud`, `part-eye`, `part-body`).
  - The tab cross-fade in `App.svelte`.
- **Game code**: no change. The amount a sale earned is read as the money difference around the
  action in the UI.
- **i18n**: none. The floating amount reuses the existing euro formatting.
- **Dependencies**: none. CSS animations and Svelte transitions only.
- **Specs**: a new `game-motion` spec.
