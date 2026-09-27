<script lang="ts">
  import { PRODUCTS_BY_PRICE } from '../game/content/products'
  import { ASSISTANT, POPULATION } from '../game/content/town'
  import { isResourceShown } from '../game/systems/buildings'
  import {
    canHireAssistant,
    hireAssistant,
    isAssistantOffered,
    isOverstocked,
    orderCap,
  } from '../game/systems/sales'
  import { demandPerMinute, incomePerMinute, soldPerMinute } from '../game/systems/salesStats'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import ArtSlot from './ArtSlot.svelte'
  import { t } from './i18n.svelte'

  const customers = $derived(amount(readGame((state) => state.customers)))
  const openOrders = $derived(amount(readGame((state) => state.openOrders)))
  const cap = $derived(amount(readGame(orderCap)))
  const assistant = $derived(readGame((state) => state.assistant))
  const offered = $derived(readGame(isAssistantOffered))
  const affordable = $derived(readGame(canHireAssistant))
  const overstocked = $derived(readGame(isOverstocked))
  const demand = $derived(amount(readGame(demandPerMinute)))
  const income = $derived(euros(readGame(incomePerMinute)))
  const sold = $derived(
    readGame((state) =>
      PRODUCTS_BY_PRICE.filter((product) => isResourceShown(state, product)).map((product) => ({
        product,
        perMinute: soldPerMinute(state, product),
      })),
    ),
  )
</script>

<section class="panel">
  <h2>{t('sales.title')}</h2>
  <div class="numbers">
    <span>{t('sales.customers', { count: customers, population: amount(POPULATION) })}</span>
    <span>{t('sales.orders', { open: openOrders, cap })}</span>
    <span>{t('sales.demand', { amount: demand })}</span>
    <span>{t('sales.income', { amount: income })}</span>
  </div>

  <div class="sold">
    <h3>{t('sales.soldTitle')}</h3>
    <dl>
      {#each sold as item (item.product)}
        <dt class:idle={item.perMinute === 0}>
          <ArtSlot kind="resource" id={item.product} size="sm" />{t(`resource.${item.product}`)}
        </dt>
        <dd class:idle={item.perMinute === 0}>{t('sales.soldPerMinute', { amount: amount(item.perMinute) })}</dd>
      {/each}
    </dl>
  </div>

  <div class="actions">
    {#if assistant}
      <p class="muted">{t('sales.assistant.active')}</p>
    {:else if offered}
      <button
        type="button"
        class="game-button"
        title={t('sales.assistant.hint')}
        disabled={!affordable}
        onclick={() => act(hireAssistant)}
      >
        {t('sales.assistant.hire', { price: euros(ASSISTANT.price) })}
      </button>
      <span class="muted">{t('sales.assistant.hint')}</span>
    {/if}
  </div>
  <!-- Always rendered, so the panel keeps its height when the message comes and goes. -->
  <p class="overstock">{overstocked ? t('sales.overstock') : ''}</p>
  {#if overstocked}
    <p class="hint">{t('sales.demandLimit')}</p>
  {/if}
</section>

<style>
  .numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
    font-variant-numeric: tabular-nums;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 0;
  }

  .sold h3 {
    margin: 0 0 2px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  dl {
    display: grid;
    grid-template-columns: max-content max-content;
    gap: 0 16px;
    margin: 0;
    font-size: 0.9rem;
  }

  dt {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .idle {
    color: var(--text-muted);
  }

  .hint {
    font-size: 0.875rem;
  }

  .muted {
    color: var(--text-muted);
  }

  .overstock {
    min-height: 1.5em;
    font-size: 0.875rem;
    font-style: italic;
    color: var(--text-muted);
  }
</style>
