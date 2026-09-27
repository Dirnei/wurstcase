# Design: ui-motion

## Context

See proposal.md for the motivation. This change builds on `ui-art`:
- The landscape clouds are `<g class="part-cloud">`.
- Animal illustrations have `part-eye` and `part-body`.
- The farm scene places each resident on a fixed slot.

Purchases and sales go through `act(action)` in `src/ui/game.svelte.ts`. `sell` returns nothing,
and the game state is a plain object mutated in place. Svelte 5 is the only framework, and no
animation library is used.

## Goals / Non-Goals

**Goals:**
- **CSS-first motion** on transform and opacity. JavaScript only decides *when* a one-shot effect
  starts.
- **One set of motion tokens**, so every effect shares the same rhythm.
- **Reduced motion handled in one place**, not per component.

**Non-Goals:**
- Physics or spring libraries, and JavaScript-driven frame loops.
- Automated visual tests. Checks happen in the browser, as for `ui-art`.

## Decisions

### 1. Motion tokens in `app.css`
These tokens are custom properties:
- `--motion-fast: 150ms` for feedback
- `--motion-enter: 200ms` for the tab cross-fade
- `--motion-pop: 280ms`
- `--motion-float: 900ms`
- `--ease-out: cubic-bezier(.2,.8,.2,1)`
- `--ease-pop: cubic-bezier(.3,1.6,.5,1)`, a slight overshoot that stands in for a spring

A single `@media (prefers-reduced-motion: reduce)` block sets the durations to `0ms` and adds
`animation: none` to the ambient part classes. Media queries update live, so a changed
preference takes effect without a reload.

### 2. Ambient motion is pure CSS, desynchronised by index
- **Clouds** get `@keyframes drift` (translateX across the viewBox and back, which is a linear
  loop). Each cloud has its own `--dur` (70, 95 and 118 s) and a negative `animation-delay`, so
  the clouds start mid-journey and never sync.
- **Eyes** get `@keyframes blink` (scaleY 1 → 0.1 → 1 in the last 4 % of the cycle), with
  `transform-box: fill-box` and `transform-origin: center`.
- **Bodies** get `@keyframes hop` (translateY 0 → -4 → 0 within the last 8 % of a 7–11 s cycle).

`FarmScene` sets `--i` on each figure from its slot index. The CSS derives the durations and
delays from `--i` with `calc()` and slightly different multipliers, so the pattern does not
visibly repeat. Because the hop only uses `translate` on the body group, the figure always
returns to its slot.

- *Alternative: JavaScript timers with randomness.* Rejected because it adds work on every frame
  or timer and bypasses the reduced-motion handling in CSS.

### 3. Purchase pop: a Svelte action keyed by a counter
`use:pop={trigger}` is a small action in `src/ui/motion/pop.ts`. When `trigger` changes, it
removes the `popping` class, forces a reflow and re-adds it. That restarts
`@keyframes pop` (scale 1 → 1.04 → 1) and makes a new pop replace a running one.

Each card keeps a local `popCount` that goes up only when its buy action actually succeeded.
`buyBuilding` and `buyUpgrade` return a boolean, and `rescue` and `buildShelter` are checked
through the state change. Scaling is visual only, the card keeps its layout box, and
`pointer-events` are untouched, so clicks go through.

### 4. The floating sale amount
The rail's Sell handler reads money before and after `act(sell)` and passes the difference to
`FloatingAmount.svelte`. The list of floats is managed by the pure `src/ui/motion/floats.ts`:
- `push(list, amount, now)` caps the list at 5 and drops the oldest
- `expire(list, now)` removes entries older than 900 ms

Both are unit tested. Each float is absolutely positioned over the button (`pointer-events:
none`) and animates translateY(-28px) with opacity 1 → 0.

Under reduced motion, `FloatingAmount` renders nothing. The top bar's money value gets a
`flash` class instead, a 600 ms background highlight with no motion. It is triggered through a
small shared `$state` counter in `src/ui/motion/saleFlash.svelte.ts`.

### 5. Tab cross-fade
`App.svelte` wraps the tab content in `{#key currentTab}` with an `in:fade` transition at
`--motion-enter` duration. There is no `out` transition, so the old content leaves at once and
the two never overlap. Svelte transitions do not see CSS media queries, so the fade duration is
read from `matchMedia('(prefers-reduced-motion: reduce)')`, kept in a `$state` that updates on
its `change` event.

## Risks / Trade-offs

- [Constant CSS animations cost battery] → There are only about 3 cloud groups and at most 30
  small animal groups, animating transform and opacity on the compositor. Browsers pause CSS
  animations in background tabs.
- [The pop feels laggy on very fast clicking] → A new pop restarts the old one instead of queuing
  behind it. The duration stays under 300 ms.
- [The money difference is misread as the sale amount] → `sell` and the difference happen in the
  same synchronous `act` call, and no tick runs in between.
- [A Svelte transition ignores the CSS reduced-motion media query] → The duration is taken from
  the reactive `matchMedia` state (decision 5).

## Migration Plan

UI only, with no save or game changes. Rollback means reverting the commit.
