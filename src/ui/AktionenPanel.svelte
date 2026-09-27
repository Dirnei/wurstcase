<script lang="ts">
  import { AKTIONEN, type AktionId } from '../game/content/aktionen'
  import { aktionCost, aktionEstimate, canRun, isAktionOffered, runAktion } from '../game/systems/aktionen'
  import { amount } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const pool = $derived(amount(readGame((state) => state.awareness)))
  const event = $derived(readGame((state) => state.megaMeat.active && { ...state.megaMeat.active }))

  const offers = $derived(
    readGame((state) =>
      AKTIONEN.filter((aktion) => isAktionOffered(state, aktion.id)).map((aktion) => ({
        id: aktion.id,
        endsEvent: aktion.endsEvent === true,
        cost: aktionCost(state, aktion.id),
        estimate: aktionEstimate(state, aktion.id),
        check: canRun(state, aktion.id),
        cooldown: Math.ceil(state.aktionen.cooldown[aktion.id]),
      })),
    ),
  )

  function run(id: AktionId) {
    act((state) => runAktion(state, id))
  }
</script>

<section class="panel">
  <h2>{t('aktionen.title')}</h2>
  <p class="pool">{t('aktionen.pool', { amount: pool })}</p>

  {#if event}
    <div class="banner" role="status">
      <strong>{t(`event.${event.event}.name`)}</strong>
      <span>{t(`event.${event.event}.description`)}</span>
      <span class="effect">
        {t(`event.${event.event}.effect`)} · {t('aktionen.eventLeft', { seconds: Math.ceil(event.remaining) })}
      </span>
    </div>
  {/if}

  <ul>
    {#each offers as offer (offer.id)}
      <li>
        <button type="button" class="game-button" disabled={offer.check !== 'ok'} onclick={() => run(offer.id)}>
          {t('aktionen.run', { name: t(`aktion.${offer.id}.name`), cost: amount(offer.cost) })}
        </button>
        <small>
          {offer.endsEvent ? t('aktionen.endsEvent') : t('aktionen.customers', { count: amount(offer.estimate) })}
          {#if offer.check === 'cooldown'}
            · {t('aktionen.cooldown', { seconds: offer.cooldown })}
          {:else if offer.check === 'noEvent'}
            · {t('aktionen.noEvent')}
          {:else if offer.check === 'awareness'}
            · {t('aktionen.lackAwareness')}
          {/if}
        </small>
      </li>
    {/each}
  </ul>
</section>

<style>
  p {
    margin: 0;
  }

  .pool {
    font-variant-numeric: tabular-nums;
  }

  .banner {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    border: 1px solid var(--danger);
    border-radius: 8px;
    color: var(--danger);
    font-size: 0.9rem;
  }

  .banner span {
    color: var(--text);
  }

  .banner .effect {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }

  small {
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
</style>
