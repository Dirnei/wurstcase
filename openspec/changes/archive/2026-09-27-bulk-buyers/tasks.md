# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/buyers.ts` with the design's lots; extend the content test (only raw ingredients and intermediates have lots, whole-euro prices, biogas below MegaMeat per unit, both below the vegan value computed from building ratios and product prices); verify `npm test` passes
- [x] 1.2 Add `unitsSold` (both buyers at 0) to `GameState` and the new-game test; verify `npm run check` and `npm test` pass

## 2. Bulk sales (tests first)

- [x] 2.1 Write `src/game/systems/bulkSales.test.ts`: 37 soybeans to MegaMeat → 30 sold, 7 left, +€3 money and earned, MegaMeat count +30; 9 soybeans → unavailable and unchanged; biogas lot of 20; selling at €195 earned for €5 unlocks the wheat field; preview matches without changing state; no lot for Tofu-Wurst; counts per buyer (30 soybeans + 8 wheat to MegaMeat = 38, 20 tofu to biogas = 20); verify the tests fail
- [x] 2.2 Implement `src/game/systems/bulkSales.ts`; verify the tests pass

## 3. Save format 4 (tests first)

- [x] 3.1 Extend `src/game/save.test.ts`: counts round-trip (including a value above 1e308); a format 3 save with 3 presses and the assistant migrates with both counts at 0; rejects fractional or negative counts; ignores unknown buyer keys; verify the new tests fail
- [x] 3.2 Bump `CURRENT_FORMAT` to 4, add migration 3 → 4, read and write `unitsSold`; verify all save and slot tests pass

## 4. UI

- [x] 4.1 Add the DE and EN keys for the panel, buyer names, flavour lines, sale label and hint; verify the dictionary test passes
- [x] 4.2 Build `BulkBuyersPanel.svelte` (per buyer: name, line, one button per shown resource with a lot, disabled below one lot) and add it after the stock panel in `App.svelte`; verify `npm run check` passes

## 5. Finished products at the biogas plant

- [x] 5.1 Change the content test (MegaMeat only raw and intermediates, biogas every resource, biogas below MegaMeat where both buy, products below their customer price) and the bulk sales test (40 Tofu-Wurst to the biogas plant → 40 sold for €6; MegaMeat still refuses Tofu-Wurst), verify they fail, then add the product lots to `buyers.ts`; verify all tests pass

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages: a new game offers soybeans and tofu at both buyers and Tofu-Wurst only at the biogas plant with their lines; selling 37 soybeans to MegaMeat leaves 7 and adds €3; buttons are disabled below one lot; wheat and oats appear at the buyers once their chains unlock; a format 3 save exported before this change imports unchanged; reload keeps the counts (checked via export)
