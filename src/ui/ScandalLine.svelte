<script lang="ts">
  import { scandalFadeSeconds, scandalFactor } from '../game/systems/bulkSales'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  // Shown from 1% lost; the fade time counts down to below 5%.
  const scandal = $derived(
    readGame((state) => {
      const loss = 1 - scandalFactor(state)
      return loss >= 0.01
        ? { percent: Math.round(loss * 100), minutes: Math.max(1, Math.round(scandalFadeSeconds(state) / 60)) }
        : null
    }),
  )
</script>

<!--
  Reserved whether or not a scandal is running, so what follows never jumps: an invisible copy of
  the longest line shares the grid cell, so the slot is as tall as the line can wrap at this width.
-->
<p class="scandal">
  <span class="reserve" aria-hidden="true">{t('scandal.line', { percent: 100, minutes: 100 })}</span>
  <span role="status">{#if scandal}{t('scandal.line', { percent: scandal.percent, minutes: scandal.minutes })}{/if}</span>
</p>

<style>
  .scandal {
    display: grid;
    margin: 0;
    color: var(--danger);
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .scandal > span {
    grid-area: 1 / 1;
  }

  .reserve {
    visibility: hidden;
  }
</style>
