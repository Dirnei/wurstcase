# Tasks

## 1. Foundation

- [x] 1.1 Add the `--art-*` tokens for day and dusk to `src/app.css`. Extend the contrast script from `ui-shell-tabs` with outline and ink pairs against both paper colours, and verify they are all at least 3:1.
- [x] 1.2 Create `src/ui/art/` with the folder layout and an `index.ts` holding the typed maps (`BUILDING_ART`, `RESOURCE_ART`, `SPECIES_ART`, `SHELTER_ART`, `AKTION_ART`, `BUYER_ART`, `EFFECT_ART`, `TAB_ART`, `STAT_ART`, `MISC_ART`). Temporarily point every map entry at one shared placeholder component. Verify `npm run check` passes, and that deleting one entry makes it fail.
- [x] 1.3 Switch `ArtSlot.svelte` to the map lookup, with `data-size` and the CSS that hides `.detail` at 20 px. Verify `npm run check` passes and the game renders.
- [x] 1.4 Add `src/dev/ArtSheet.svelte` to the developer page: every map entry at 20, 32, 48 and 96 px on light and dark panels, labelled by id, plus the landscape in day and dusk. Verify in the browser at `#dev`.

## 2. Reference pieces

- [x] 2.1 Draw the soybean field, tofu and chicken in the approved storybook style, following the style guide, and replace their placeholders. Verify on the art sheet that all sizes read clearly and dusk works.

## 3. Production art

- [x] 3.1 Draw the remaining 8 buildings. Verify on the art sheet and on the Produktion tab.
- [x] 3.2 Draw the remaining 8 resources, each with a distinct silhouette at 20 px. Verify on the art sheet at 20 px and in the rail.

## 4. Lebenshof, Aktionen and sales art

- [x] 4.1 Draw the pig and the cow with the named parts `part-eye` and `part-body`, and the stable and pasture. Verify on the art sheet.
- [x] 4.2 Draw the 4 Aktionen, the 2 bulk buyers (MegaMeat animal-feed sack with the made-up crowned-sausage mark, biogas plant) and the MegaMeat mark and newspaper for `MISC_ART`. Verify on the art sheet.

## 5. UI icons

- [x] 5.1 Draw the 9 upgrade effect-type icons, the 6 tab icons, and the stat icons (money, income, awareness, play time, customers, orders). Verify on the art sheet, and remove the shared placeholder component once no map uses it.
- [x] 5.2 Show the effect art plus the art of the first named target on upgrade cards. Verify on the Upgrades tab that "second farmer" shows the faster-production and soybean field art.

## 6. Scenes

- [x] 6.1 Build `Landscape.svelte` with the day and dusk layers, bottom-anchored `slice`, and cloud groups with the `part-cloud` class. Render it only on game routes. Verify at 1280 × 720, 2560 × 1080 and 375 × 667 in both schemes, and that `#impressum` does not show it.
- [x] 6.2 Write a Vitest test for the pure slot layout in `src/ui/art/farmSlots.ts`: 30 slots, the same slot for the same index, and a cap with the remainder. Then implement it. Verify `npm test` passes.
- [x] 6.3 Build `FarmScene.svelte` (shelters, residents on slots, "+N", hidden summary via the new `farm.*` i18n keys in DE and EN) at the top of the Lebenshof tab. Verify in the browser with 2 chickens and 1 stable, and with 45 residents.

## 7. Emoji removal

- [x] 7.1 Remove 📣 from the four i18n strings in both languages, and render the awareness art in `TopBar`, `LebenshofPanel` and `AktionenPanel`. Replace 📰 in `NewsTicker` with the newspaper art. Verify with a search that no UI file or dictionary string contains an emoji other than the Ko-fi ☕.
- [x] 7.2 Remove `emoji` from `SpeciesDef` and `SPECIES` in `src/game/content/animals.ts`, use `SPECIES_ART` in the Lebenshof lists, and label species by id in `DevPage.svelte`. Verify `npm run check` and `npm test` pass.

## 8. Verification

- [x] 8.1 Run `npm test`, `npm run check` and `npm run build`. All pass, and the built JavaScript grew by no more than about 100 KB compared with before this change.
- [x] 8.2 Play-check in the headless browser and save screenshots to the scratchpad:
  - every tab at 1280 × 720, light and dark
  - the phone layout
  - the art sheet
  - browser zoom at 200 % (sharp art)
  - the recorded network requests (no new hosts)
- [x] 8.3 Rebuild and restart the Docker container with `docker compose up --build -d` and leave it running. Verify the game at http://localhost:8234 shows the art.
