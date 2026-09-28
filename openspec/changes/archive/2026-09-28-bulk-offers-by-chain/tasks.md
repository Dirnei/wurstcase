# Tasks

## 1. Row plan

- [x] 1.1 In `BulkBuyersPanel.svelte`, build the rows from `CHAIN_RESOURCES`: per chain, the
  resources shown at any buyer in production order, dropping chains with none; each card renders
  one heading row per chain and one row per planned resource (its offer or a placeholder), and
  spans `1 + rows` of the subgrid. Verify in the browser with the soy and oat chains unlocked that
  both cards show Soy before Oats and that soybeans, tofu, oats and oat drink sit at the same
  height in both cards.

## 2. Headings and placeholder

- [x] 2.1 Add `bulk.noProducts` to `en.json` and `de.json`, render it as MegaMeat's placeholder in
  product rows, and style the chain headings like the rail's group labels. Verify the i18n
  key-parity test passes and the note sits in the Tofu-Wurst row of MegaMeat's card.

## 3. Verification

- [x] 3.1 Run the tests, the type check and the production build and check they pass.
- [x] 3.2 Play-check in the browser in DE and EN at 1280 × 720, 900 px and 375 × 667: groups in
  chain order, only unlocked chains shown, rows aligned side by side, stacked cards on the phone
  without empty gaps, and nothing moving while stock ticks or markets recover.
