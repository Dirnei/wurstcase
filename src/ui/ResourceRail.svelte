<script lang="ts">
  import { RESOURCES } from '../game/content/resources'
  import { POPULATION } from '../game/content/town'
  import { isResourceShown } from '../game/systems/buildings'
  import { canSell, isOverstocked, orderCap, saleValue, sell } from '../game/systems/sales'
  import { stockTrend, type Trend } from '../game/systems/trend'
  import { amount, euros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import FloatingAmount from './FloatingAmount.svelte'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { expire, FLOAT_MS, push, type Float } from './motion/floats'
  import { prefersReducedMotion } from './motion/reducedMotion.svelte'
  import { noteSale } from './motion/saleFlash.svelte'

  const MARKS: Record<Trend, string> = { rising: '▲', falling: '▼', steady: '▬' }

  let stockOpen = $state(false)

  const items = $derived(
    readGame((state) =>
      RESOURCES.filter((resource) => isResourceShown(state, resource)).map((resource) => ({
        resource,
        stock: amount(state.stock[resource]),
        short: state.shortage[resource] !== undefined,
        trend: stockTrend(state, resource),
      })),
    ),
  )
  const money = $derived(euros(readGame((state) => state.money)))
  const customers = $derived(
    t('rail.ofTotal', { count: amount(readGame((state) => state.customers)), total: amount(POPULATION) }),
  )
  const orders = $derived(
    t('rail.ofTotal', { count: amount(readGame((state) => state.openOrders)), total: amount(readGame(orderCap)) }),
  )
  const assistant = $derived(readGame((state) => state.assistant))
  const sellable = $derived(readGame(canSell))
  const value = $derived(euros(readGame(saleValue)))
  const overstocked = $derived(readGame(isOverstocked))

  let floats = $state<Float[]>([])

  // The sale's value is the money difference around the action; no tick runs in between.
  function onSell() {
    let earned = 0
    act((state) => {
      const before = state.money
      sell(state)
      earned = state.money.sub(before).toNumber()
    })
    if (earned <= 0) return
    noteSale()
    if (prefersReducedMotion()) return
    floats = push(floats, t('sale.earned', { amount: euros(earned) }), performance.now())
    setTimeout(() => (floats = expire(floats, performance.now())), FLOAT_MS + 50)
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && stockOpen) {
      stockOpen = false
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<aside class="rail" aria-label={t('rail.label')}>
  <section class="stock" class:open={stockOpen} id="rail-stock">
    <h2>{t('stock.title')}</h2>
    <dl>
      {#each items as item (item.resource)}
        <div class="row" class:short={item.short}>
          <dt>
            <ArtSlot kind="resource" id={item.resource} size="sm" />
            <span class="name">{t(`resource.${item.resource}`)}</span>
          </dt>
          <dd class="amount" title={item.short ? t('stock.short') : undefined}>
            {item.stock}
            {#if item.short}<span class="visually-hidden">({t('stock.short')})</span>{/if}
          </dd>
          <dd class="trend {item.trend}" title={t(`stock.trend.${item.trend}`)}>
            <span aria-hidden="true">{MARKS[item.trend]}</span>
            <span class="visually-hidden">{t(`stock.trend.${item.trend}`)}</span>
          </dd>
        </div>
      {/each}
    </dl>
  </section>

  <section class="shop">
    <h2>{t('rail.shop')}</h2>
    <dl class="numbers">
      <div class="phone-only">
        <dt>{t('money.label')}</dt>
        <dd>{money}</dd>
      </div>
      <div class="wide-only">
        <dt><ArtSlot kind="stat" id="customers" size="sm" /><span class="name">{t('rail.customers')}</span></dt>
        <dd>{customers}</dd>
      </div>
      <div class="wide-only">
        <dt><ArtSlot kind="stat" id="orders" size="sm" /><span class="name">{t('rail.orders')}</span></dt>
        <dd>{orders}</dd>
      </div>
    </dl>
    {#if assistant}
      <p class="assistant">{t('sales.assistant.active')}</p>
    {:else}
      <span class="sell-wrap">
        <button type="button" class="game-button primary sell" disabled={!sellable} onclick={onSell}>
          {sellable ? t('sales.sellFor', { amount: value }) : t('sales.sell')}
        </button>
        <FloatingAmount {floats} />
      </span>
    {/if}
    <!-- Always rendered, so the rail keeps its height when the warning comes and goes. -->
    <p class="overstock" role="status">{overstocked ? t('rail.overstock') : ''}</p>
    <button
      type="button"
      class="game-button stock-toggle"
      aria-expanded={stockOpen}
      aria-controls="rail-stock"
      aria-label={stockOpen ? t('rail.hideStock') : t('rail.showStock')}
      onclick={() => (stockOpen = !stockOpen)}
    >
      {t('stock.title')} <span aria-hidden="true">{stockOpen ? '▼' : '▲'}</span>
    </button>
  </section>
</aside>

<style>
  .rail {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 12px;
    border: var(--outline) solid var(--ink);
    border-radius: var(--radius);
    background: var(--paper);
    box-shadow: 0 2px 0 var(--shadow);
    overflow-y: auto;
  }

  h2 {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 600;
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin: 0;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto 14px;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
  }

  dt {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .trend {
    font-size: 0.7rem;
    text-align: center;
  }

  .rising {
    color: var(--leaf-text);
  }

  .falling,
  .short {
    color: var(--danger);
  }

  .steady {
    color: var(--ink-muted);
  }

  .shop {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .numbers > div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.875rem;
  }

  .numbers > .phone-only,
  .stock-toggle {
    display: none;
  }

  .sell-wrap {
    position: relative;
    display: grid;
  }

  .sell {
    min-height: 44px;
    font-size: 1rem;
    box-shadow: 0 2px 0 var(--ink);
  }

  p {
    margin: 0;
  }

  .assistant {
    font-size: 0.875rem;
    font-style: italic;
    color: var(--ink-muted);
  }

  .overstock {
    min-height: 1.3em;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--danger);
  }

  /* Tablet: amounts and marks only; names stay for screen readers. */
  @media (min-width: 768px) and (max-width: 1023px) {
    .name {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }

    .numbers > div {
      flex-direction: column;
      gap: 0;
    }
  }

  /* Phone: a strip above the tab bar, with the stock as a sheet on demand. */
  @media (max-width: 767px) {
    .rail {
      position: fixed;
      z-index: 19;
      inset: auto 0 calc(var(--tabbar-height) + env(safe-area-inset-bottom)) 0;
      max-height: 70dvh;
      padding: 8px 12px;
      border-radius: var(--radius) var(--radius) 0 0;
      border-bottom: none;
      box-shadow: 0 -2px 0 var(--shadow);
    }

    .shop h2 {
      display: none;
    }

    .shop {
      display: grid;
      grid-template-columns: auto auto 1fr;
      align-items: center;
      gap: 4px 8px;
    }

    .numbers > .wide-only {
      display: none;
    }

    .numbers > .phone-only {
      display: flex;
      flex-direction: column;
      gap: 0;
      font-size: 0.75rem;
    }

    .stock-toggle {
      display: block;
      grid-column: 2;
      grid-row: 1;
      min-height: 44px;
      text-align: center;
    }

    .sell-wrap,
    .assistant {
      grid-column: 3;
      grid-row: 1;
    }

    .overstock {
      grid-column: 1 / -1;
      min-height: 0;
    }

    .overstock:empty {
      display: none;
    }

    .stock {
      display: none;
      order: 1;
    }

    .stock.open {
      display: block;
    }
  }
</style>
