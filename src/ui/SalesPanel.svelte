<script lang="ts">
  import { ASSISTANT } from '../game/content/town'
  import {
    canHireAssistant,
    canSell,
    hireAssistant,
    isAssistantOffered,
    isOverstocked,
    orderCap,
    saleValue,
    sell,
  } from '../game/systems/sales'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const customers = $derived(amount(readGame((state) => state.customers)))
  const openOrders = $derived(amount(readGame((state) => state.openOrders)))
  const cap = $derived(amount(readGame(orderCap)))
  const sellable = $derived(readGame(canSell))
  const value = $derived(euros(readGame(saleValue)))
  const assistant = $derived(readGame((state) => state.assistant))
  const offered = $derived(readGame(isAssistantOffered))
  const affordable = $derived(readGame(canHireAssistant))
  const overstocked = $derived(readGame(isOverstocked))
</script>

<section class="panel">
  <h2>{t('sales.title')}</h2>
  <div class="numbers">
    <span>{t('sales.customers', { count: customers })}</span>
    <span>{t('sales.orders', { open: openOrders, cap })}</span>
  </div>

  <div class="actions">
    {#if assistant}
      <p class="muted">{t('sales.assistant.active')}</p>
    {:else}
      <button type="button" class="game-button" disabled={!sellable} onclick={() => act(sell)}>
        {sellable ? t('sales.sellFor', { amount: value }) : t('sales.sell')}
      </button>
      {#if offered}
        <button
          type="button"
          class="game-button"
          title={t('sales.assistant.hint')}
          disabled={!affordable}
          onclick={() => act(hireAssistant)}
        >
          {t('sales.assistant.hire', { price: euros(ASSISTANT.price) })}
        </button>
      {/if}
    {/if}
  </div>

  <!-- Always rendered, so the panel keeps its height when the message comes and goes. -->
  <p class="overstock">{overstocked ? t('sales.overstock') : ''}</p>
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
