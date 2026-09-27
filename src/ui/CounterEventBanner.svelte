<script lang="ts">
  import { canRun } from '../game/systems/aktionen'
  import ArtSlot from './ArtSlot.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const event = $derived(readGame((state) => state.megaMeat.active && { ...state.megaMeat.active }))
  const factCheck = $derived(readGame((state) => canRun(state, 'factCheck') === 'ok'))
</script>

{#if event}
  <div class="banner" role="status">
    <ArtSlot kind="buyer" id="megaMeat" size="md" />
    <div class="text">
      <strong>{t(`event.${event.event}.name`)}</strong>
      <span>{t(`event.${event.event}.description`)}</span>
      <span class="effect">
        {t(`event.${event.event}.effect`)} · {t('aktionen.eventLeft', { seconds: Math.ceil(event.remaining) })}
      </span>
    </div>
    {#if factCheck}
      <a class="game-button primary" href="#aktionen">{t('banner.toFactCheck')}</a>
    {/if}
  </div>
{/if}

<style>
  .banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 8px 12px;
    border: var(--outline) solid var(--danger);
    border-radius: var(--radius);
    background: var(--paper);
    font-size: 0.875rem;
  }

  .text {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    min-width: 12em;
  }

  strong {
    color: var(--danger);
  }

  .effect {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  a {
    text-decoration: none;
  }
</style>
