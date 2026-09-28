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
  import { amount, euros, liveAmount, liveEuros } from './amounts'
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
  const demand = $derived(liveAmount(readGame(demandPerMinute)))
  const income = $derived(liveEuros(readGame(incomePerMinute)))
  const population = $derived(amount(POPULATION))
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
    <div class="stat" title={t('sales.stat.customersHint', { population })}>
      <span class="label">{t('sales.stat.customers')}</span>
      <span class="value">{t('sales.stat.customersValue', { count: customers, population })}</span>
    </div>
    <div class="stat">
      <span class="label">{t('sales.stat.orders')}</span>
      <span class="value">{t('sales.stat.ordersValue', { open: openOrders, cap })}</span>
    </div>
    <div class="stat">
      <span class="label">{t('sales.stat.demand')}</span>
      <span class="value">{t('sales.perMinute', { amount: demand })}</span>
    </div>
    <div class="stat">
      <span class="label">{t('sales.stat.income')}</span>
      <span class="value">{t('sales.perMinute', { amount: income })}</span>
    </div>
  </div>

  <div class="sold">
    <h3>{t('sales.soldTitle')}</h3>
    <dl>
      {#each sold as item (item.product)}
        <dt class:idle={item.perMinute === 0}>
          <ArtSlot kind="resource" id={item.product} size="sm" />
          <span class="name">{t(`resource.${item.product}`)}</span>
        </dt>
        <dd class:idle={item.perMinute === 0}>{t('sales.soldPerMinute', { amount: liveAmount(item.perMinute) })}</dd>
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
  /* The grid owns every width, so a changing value only moves its own digits. */
  .numbers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 6px 10px;
    border: 1.4px solid var(--ink);
    border-radius: var(--radius-sm);
    background: var(--paper-2);
  }

  .label {
    overflow: hidden;
    color: var(--text-muted);
    font-size: 0.8rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .value {
    font-size: 1.15rem;
    font-weight: 800;
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
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

  /* Icon and name share the first track; the value track fits the fixed-decimal form. */
  dl {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(9ch, max-content);
    gap: 2px 16px;
    max-width: 420px;
    margin: 0;
    font-size: 0.9rem;
  }

  dt {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  dd {
    margin: 0;
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
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
