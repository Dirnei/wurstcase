<script lang="ts">
  import { formatDuration } from '../format/duration'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const playTime = $derived(formatDuration(readGame((state) => state.playTime)))
</script>

<section>
  <span class="label">{t('playTime.label')}</span>
  <span class="value">{playTime}</span>
</section>

<style>
  section {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }

  .label {
    color: var(--text-muted);
  }

  .value {
    font-variant-numeric: tabular-nums;
    font-size: 1.25rem;
    font-weight: 600;
  }
</style>
