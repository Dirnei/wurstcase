# Tasks

## 1. Foundation

- [x] 1.1 Add the motion tokens and the single reduced-motion block to `src/app.css`. Verify with `npm run check` and in the browser: with emulated `prefers-reduced-motion: reduce`, the computed `--motion-pop` is `0ms`.
- [x] 1.2 Write `src/ui/motion/floats.test.ts` (push caps at 5 and drops the oldest; expire removes entries older than 900 ms), then implement `src/ui/motion/floats.ts`. Verify `npm test` passes.

## 2. Ambient motion

- [x] 2.1 Add the `drift` keyframes for the `part-cloud` groups in `Landscape.svelte`, each cloud with its own duration and negative delay. Verify in the browser that after 10 s every cloud has moved, and none is in step with another.
- [x] 2.2 Add the `blink` keyframes for `part-eye` and a `hop` for the whole figure (so the eyes hop along), desynchronised through per-figure rhythm variables that `FarmScene.svelte` derives from the rescue index. Verify with 5 chickens that the blinks happen at different times and every chicken returns to its slot.

## 3. Feedback

- [x] 3.1 Add the `pop` action (`src/ui/motion/pop.ts`) and use it on building cards, upgrade cards, shelter entries and rescue entries, triggered only when the purchase succeeds. Verify in the browser:
  - buying pops only that card
  - an unaffordable click does not pop
  - neighbouring cards keep their positions (compare their bounding boxes before and after)
- [x] 3.2 Add `FloatingAmount.svelte` to the rail's Sell button, fed from the money difference around `act(sell)` and managed by `floats.ts`. Verify that one sale floats "+€…" in the current language format, and that 10 rapid sales never show more than 5 floats.
- [x] 3.3 Add the reduced-motion fallback: `saleFlash.svelte.ts` plus a `flash` class on the top bar money, and no floats rendered. Verify with emulated reduced motion that a sale flashes the money, nothing floats, and the clouds and animals stand still.

## 4. Tab cross-fade

- [x] 4.1 Wrap the tab content in `{#key}` with an `in:fade` at `--motion-enter`, with the duration taken from a reactive reduced-motion `matchMedia` state. Verify in the browser that switching fades the new tab in, the old content never shows at the same time, and under reduced motion the switch is instant.

## 5. Verification

- [x] 5.1 Run `npm test`, `npm run check` and `npm run build`. All pass.
- [x] 5.2 Play-check in the headless browser. Save screenshots, and a short sequence of frames for the float and the pop, to the scratchpad. Check:
  - purchase and sale feedback on each tab
  - clicking during a pop still works
  - the phone layout
  - dark mode
  - reduced motion on and off without a reload
- [x] 5.3 Rebuild and restart the Docker container with `docker compose up --build -d` and leave it running. Verify the game at http://localhost:8234 shows the motion.
