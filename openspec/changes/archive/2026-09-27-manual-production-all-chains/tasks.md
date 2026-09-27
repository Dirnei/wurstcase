# Tasks

## 1. Content (tests first)

- [x] 1.1 Add content tests to `src/game/content/content.test.ts`: every building has exactly one manual action linked to it; each action's chain, output resource and input resource equal its building's; input amount equals the building's `ratio` and output amount is 1; fields' actions have no input; verify the tests fail
- [x] 1.2 Rewrite `src/game/content/manual.ts` as in the design (entries `{ id, building }`, six new ids, `MANUAL_ACTIONS` derived with `input`, `output`, `chain`, `building`); verify the content tests and the existing soy manual tests pass

## 2. Unlock rule (tests first)

- [x] 2.1 Add tests to `src/game/systems/manual.test.ts`: in a new game only the soy actions are unlocked; at the wheat field's unlock "harvest wheat" and "make seitan" are unlocked and "bake Leverkas" is not; a locked action with enough input is unavailable and `performManual` changes no stock; the wheat chain by hand (4 × harvest, 2 × seitan, 1 × Leverkas → 1 Leverkas, no wheat or seitan left); the oat chain by hand (2 × harvest, 1 × oat drink, 1 × Hafer-Cappuccino → 1 Hafer-Cappuccino); verify the new tests fail
- [x] 2.2 Add `isManualUnlocked` to `src/game/systems/manual.ts` and require it in `canPerform`; verify all manual tests pass

## 3. UI and text

- [x] 3.1 Add the six labels (`manual.harvestWheat`, `makeSeitan`, `bakeLeverkas`, `harvestOats`, `makeOatDrink`, `makeHaferCappuccino`) to `src/i18n/de.json` and `src/i18n/en.json`; verify the dictionary test passes
- [x] 3.2 Group `src/ui/ManualActions.svelte` by chain in `CHAINS` order under the `chain.<id>` heading, showing only unlocked actions and skipping empty groups; verify `npm run check` passes

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check in both languages: a new game shows only the soy group; at €200 earned the wheat group shows harvest and seitan, and "bake Leverkas" appears at €1,500; the oat group appears at €5,000; a Leverkas and a Hafer-Cappuccino made fully by hand show up in stock and sell; buttons are disabled without enough input; a reload keeps the unlocked groups
