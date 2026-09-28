<script lang="ts">
  import { CHAIN_RESOURCES } from '../game/content/buildings'
  import { POPULATION } from '../game/content/town'
  import { isResourceShown } from '../game/systems/buildings'
  import { canSell, isOverstocked, orderCap, saleValue, sell } from '../game/systems/sales'
  import { canExpand, expandStoreroom, expansionPrice, storeroomRoom } from '../game/systems/storeroom'
  import { stockTrend, type Trend } from '../game/systems/trend'
  import { amount, euros, liveCount } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import FloatingAmount from './FloatingAmount.svelte'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { expire, FLOAT_MS, push, type Float } from './motion/floats'
  import { prefersReducedMotion } from './motion/reducedMotion.svelte'
  import { noteSale } from './motion/saleFlash.svelte'

  const MARKS: Record<Trend, string> = { rising: '▲', falling: '▼', steady: '▬' }

  let stockOpen = $state(false)

  // One group per chain, in production order; a chain with nothing shown yet has no group.
  const groups = $derived(
    readGame((state) =>
      CHAIN_RESOURCES.map(({ chain, resources }) => ({
        chain,
        items: resources
          .filter((resource) => isResourceShown(state, resource))
          .map((resource) => ({
            resource,
            stock: liveCount(state.stock[resource]),
            short: state.shortage[resource] !== undefined,
            full: state.full[resource] !== undefined,
            trend: stockTrend(state, resource),
          })),
      })).filter((group) => group.items.length > 0),
    ),
  )
  const level = $derived(readGame((state) => state.storeroom))
  const room = $derived(amount(readGame(storeroomRoom)))
  const expansion = $derived(euros(readGame(expansionPrice)))
  const expandable = $derived(readGame(canExpand))
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

  function onExpand() {
    act(expandStoreroom)
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
    <div class="storeroom">
      <ArtSlot kind="stat" id="storeroom" size="sm" />
      <h2>{t('storeroom.title')} · {t('storeroom.level', { level })}</h2>
      <p class="room">{t('storeroom.room', { amount: room })}</p>
      <button type="button" class="game-button expand" disabled={!expandable} onclick={onExpand}>
        {t('storeroom.expand', { price: expansion })}
      </button>
    </div>
    {#each groups as group (group.chain)}
      <div class="group" role="group" aria-labelledby="stock-chain-{group.chain}">
        <h3 id="stock-chain-{group.chain}">{t(`chain.${group.chain}`)}</h3>
        <dl>
          {#each group.items as item (item.resource)}
            <div class="row" class:short={item.short} class:full={item.full}>
              <dt>
                <ArtSlot kind="resource" id={item.resource} size="sm" />
                <span class="name">{t(`resource.${item.resource}`)}</span>
              </dt>
              <dd class="amount" title={item.short ? t('stock.short') : undefined}>
                {item.stock}
                {#if item.short}<span class="visually-hidden">({t('stock.short')})</span>{/if}
                {#if item.full}
                  <span class="badge" title={t('stock.full')}>
                    <span class="badge-text" aria-hidden="true">{t('stock.fullBadge')}</span>
                    <span class="badge-mark" aria-hidden="true">■</span>
                  </span>
                  <span class="visually-hidden">({t('stock.full')})</span>
                {/if}
              </dd>
              <dd class="trend {item.trend}" title={t(`stock.trend.${item.trend}`)}>
                <span aria-hidden="true">{MARKS[item.trend]}</span>
                <span class="visually-hidden">{t(`stock.trend.${item.trend}`)}</span>
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    {/each}
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

  .stock {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .storeroom {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 2px 8px;
  }

  .storeroom h2 {
    margin: 0;
  }

  .room {
    grid-column: 2;
    font-size: 0.8rem;
    color: var(--ink-muted);
  }

  .expand {
    grid-column: 1 / -1;
    margin-top: 4px;
    font-size: 0.875rem;
  }

  h3 {
    margin: 0 0 2px;
    color: var(--ink-muted);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
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

  /* A fixed minimum, so the column no longer follows the widest value as stock ticks. */
  .amount {
    min-width: 9ch;
  }

  .badge {
    margin-left: 4px;
    padding: 0 4px;
    border: 1.2px solid currentColor;
    color: var(--danger);
    border-radius: var(--radius-sm);
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    vertical-align: middle;
  }

  .badge-mark {
    display: none;
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

  /* Tablet: amounts and marks only; names and chain labels stay for screen readers. */
  @media (min-width: 768px) and (max-width: 1023px) {
    .group + .group {
      padding-top: 8px;
      border-top: 1.4px solid var(--line);
    }

    .room {
      display: none;
    }

    /* Too narrow for the word: a mark with the same tooltip and hidden text. */
    .badge {
      padding: 0;
      border: none;
    }

    .badge-text {
      display: none;
    }

    .badge-mark {
      display: inline;
    }

    .name,
    h3 {
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
      display: flex;
    }
  }
</style>
