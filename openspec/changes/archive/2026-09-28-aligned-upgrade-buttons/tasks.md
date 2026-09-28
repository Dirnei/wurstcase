# Tasks

## 1. Card layout

- [x] 1.1 In `UpgradesPanel.svelte`, give the offer cards `grid-template-rows: 1fr auto`, align
  the art and text to the top of row 1, and put the button in row 2. Verify in the browser that two
  side-by-side offers with different text lengths have their buttons at the same height, at the
  bottom of the cards.

## 2. Button size

- [x] 2.1 Give the buy buttons the Produktion tab's Buy button height (`min-height: 30px;
  padding-block: 2px`, 44px below 768 px) and `white-space: nowrap`. Verify in the browser at
  1280 px that an Upgrades buy button and a Produktion Buy button have the same height, and at
  375 px that the buttons are 44 px tall.

## 3. Verification

- [x] 3.1 Run the tests, the type check and the production build and check they pass.
- [x] 3.2 Play-check in the browser in DE and EN at 1280 × 720, 900 px and 375 × 667 with at least
  four offers on the Upgrades tab: buttons line up in every row, none wraps its text, and a long
  German price on the narrowest card still fits.
