<script lang="ts">
  import { euros } from './amounts'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const money = $derived(euros(readGame((state) => state.money)))
</script>

<section>
  <span class="label">{t('money.label')}</span>
  <span class="value">{money}</span>
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
