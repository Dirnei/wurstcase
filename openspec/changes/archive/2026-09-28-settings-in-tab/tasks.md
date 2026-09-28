# Tasks

## 1. Top bar

- [x] 1.1 Remove the `.tools` block (language group and gear link), its imports and styles from
  `TopBar.svelte`. Verify in the browser that the top bar shows only the name and the stats, and
  that money ticking still moves nothing.
- [x] 1.2 Revisit the phone rules in `TopBar.svelte` now that `.tools` is gone: keep the two-row
  layout unless brand and three slots fit on one row at 320 px. Verify at 320 px and 375 px that
  no value is clipped and nothing scrolls sideways.

## 2. Tab strip

- [x] 2.1 In `TabNav.svelte`, remove both rules that hide `.settings` and the `class:settings`
  binding. Verify in the browser at 900 px that Einstellungen is the last tab and opens the tab.
- [x] 2.2 Verify at 320 px and 375 px that the bottom bar shows six tabs, each at least 44 × 44 px,
  that "Einstellungen" / "Settings" is readable, and check once with only the first tabs unlocked
  (locked tabs show their hint).

## 3. Text

- [x] 3.1 Remove `language.toggle.label` from `en.json` and `de.json` after a search confirms
  nothing uses it. Verify the i18n key-parity test and the type check pass.

## 4. Verification

- [x] 4.1 Run the tests, the type check and the production build and check they pass.
- [x] 4.2 Play-check in the browser at 1280 × 720, 900 px and 375 × 667: switch language in
  Einstellungen and check all text changes and the play time keeps counting, reload and check the
  language is kept, and check no gear or DE/EN toggle remains in the top bar.
