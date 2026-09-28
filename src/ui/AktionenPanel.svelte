<script lang="ts">
  import { AKTIONEN, type AktionId } from '../game/content/aktionen'
  import { aktionCost, aktionEstimate, canRun, isAktionOffered, runAktion } from '../game/systems/aktionen'
  import { amount } from './amounts'
  import { act, readGame } from './game.svelte'
  import ArtSlot from './ArtSlot.svelte'
  import ScandalLine from './ScandalLine.svelte'
  import { t } from './i18n.svelte'

  const pool = $derived(amount(readGame((state) => state.awareness)))

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
  <p class="pool"><ArtSlot kind="stat" id="awareness" size="sm" />{t('aktionen.pool', { amount: pool })}</p>
  <ScandalLine />


  <ul>
    {#each offers as offer (offer.id)}
      <li class="card">
        <ArtSlot kind="aktion" id={offer.id} size="lg" />
        <small>
          {offer.endsEvent ? t('aktionen.endsEvent') : t('aktionen.customers', { count: amount(offer.estimate) })}
          {#if offer.check === 'cooldown'}
            <br />{t('aktionen.cooldown', { seconds: offer.cooldown })}
          {:else if offer.check === 'noEvent'}
            <br />{t('aktionen.noEvent')}
          {:else if offer.check === 'awareness'}
            <br />{t('aktionen.lackAwareness')}
          {/if}
        </small>
        <button type="button" class="game-button primary" disabled={offer.check !== 'ok'} onclick={() => run(offer.id)}>
          {t('aktionen.run', { name: t(`aktion.${offer.id}.name`), cost: amount(offer.cost) })}
          <ArtSlot kind="stat" id="awareness" size="sm" /><span class="visually-hidden">{t('topbar.awareness')}</span>
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  p {
    margin: 0;
  }

  .pool {
    display: flex;
    align-items: center;
    gap: 6px;
    font-variant-numeric: tabular-nums;
  }

  li button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 48px 1fr;
    align-items: center;
    gap: 6px 10px;
    padding: 10px;
  }

  li button {
    grid-column: 1 / -1;
  }

  small {
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
</style>
