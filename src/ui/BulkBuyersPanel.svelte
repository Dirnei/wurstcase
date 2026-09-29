<script lang="ts">
  import { BULK_SHARES, BUYERS, type BuyerId } from '../game/content/buyers'
  import { CHAIN_RESOURCES, type ChainId } from '../game/content/buildings'
  import { PRODUCTS, type ResourceId } from '../game/content/resources'
  import {
    bestBuyer,
    bulkSaleCost,
    bulkSaleUnits,
    bulkSaleValue,
    bulkSell,
    canBulkSell,
    hasLot,
    isFlooded,
    marketLevel,
    timeToRecover,
    unitPrice,
  } from '../game/systems/bulkSales'
  import { isResourceShown } from '../game/systems/buildings'
  import { liveCount } from './amounts'
  import { act, readGame } from './game.svelte'
  import ArtSlot from './ArtSlot.svelte'
  import BulkOfferCell, { type Offer } from './BulkOfferCell.svelte'
  import ScandalLine from './ScandalLine.svelte'
  import { bulkShare } from './bulkShare.svelte'
  import { t } from './i18n.svelte'

  type Row =
    | { kind: 'chain'; chain: ChainId }
    | { kind: 'resource'; resource: ResourceId; stock: string; offers: (Offer | null)[] }

  /** The market level the recovery time counts down to. */
  const RECOVERED = 0.95

  const share = $derived(bulkShare.value)

  /**
   * Per chain, a separator and then every shown resource any buyer takes, in production order;
   * chains with nothing to offer are left out. Each row has one cell per buyer, null where the buyer
   * does not take the resource.
   */
  const rows = $derived(
    readGame((state) =>
      CHAIN_RESOURCES.flatMap(({ chain, resources }): Row[] => {
        const offered = resources.filter(
          (resource) => isResourceShown(state, resource) && BUYERS.some((buyer) => hasLot(buyer.id, resource)),
        )
        if (offered.length === 0) {
          return []
        }
        return [
          { kind: 'chain', chain },
          ...offered.map((resource): Row => {
            const prices = BUYERS.filter((buyer) => hasLot(buyer.id, resource)).map(
              (buyer) => unitPrice(state, buyer.id, resource) ?? 0,
            )
            // Marked only when two buyers compete and do not pay the same.
            const marked =
              prices.length > 1 && prices.some((price) => price !== prices[0]) ? bestBuyer(state, resource)?.buyer : undefined
            return {
              kind: 'resource',
              resource,
              stock: liveCount(state.stock[resource]),
              offers: BUYERS.map((buyer): Offer | null =>
                hasLot(buyer.id, resource)
                  ? {
                      perUnit: unitPrice(state, buyer.id, resource) ?? 0,
                      paysMore: buyer.id === marked,
                      // One sale at the chosen share, priced as if it were the only one (along its flood).
                      sellable: canBulkSell(state, buyer.id, resource, share),
                      units: bulkSaleUnits(state, buyer.id, resource, share),
                      value: bulkSaleValue(state, buyer.id, resource, share),
                      cost: bulkSaleCost(state, buyer.id, resource, share),
                      market: isFlooded(buyer.id, resource)
                        ? { level: marketLevel(state, resource, buyer.id), recover: timeToRecover(state, resource, RECOVERED, buyer.id) }
                        : null,
                    }
                  : null,
              ),
            }
          }),
        ]
      }),
    ),
  )

  function sell(buyer: BuyerId, resource: ResourceId) {
    act((state) => bulkSell(state, buyer, resource, share))
  }

  // Wide screens: the resource, then one column per buyer; MegaMeat's also holds the cost track.
  const columns = [
    'minmax(0, 0.5fr)',
    ...BUYERS.map((buyer) => (buyer.feedCost !== undefined ? 'minmax(0, 1.35fr)' : 'minmax(0, 1fr)')),
  ].join(' ')

  // The sticky bar's height, so rows snap (and scroll into view) just below it; the bar sticks
  // 8 px above the tab's top edge, so that is its height minus 8 px, plus a 2 px gap.
  let barHeight = $state(0)

  const isProduct = (resource: ResourceId) => PRODUCTS.includes(resource as (typeof PRODUCTS)[number])

  const percent = (value: number) => Math.round(value * 100)

  /** Arrow keys move the choice, as in any radio group. */
  function onShareKey(event: KeyboardEvent) {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key]
    if (step === undefined) {
      return
    }
    event.preventDefault()
    const index = BULK_SHARES.indexOf(share as (typeof BULK_SHARES)[number])
    const next = (index + step + BULK_SHARES.length) % BULK_SHARES.length
    bulkShare.value = BULK_SHARES[next]
    const group = event.currentTarget as HTMLElement
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }
</script>

<section class="panel">
  <h2>{t('bulk.title')}</h2>
  <p class="muted">{t('bulk.hint')}</p>
  <!-- Phones: the scandal line above the bar, so the sticky bar stays one line tall. -->
  <div class="scandal-narrow"><ScandalLine /></div>
  <div class="shares" bind:clientHeight={barHeight}>
    <span class="shares-label" id="bulk-share-label">{t('bulk.shareChoice')}</span>
    <div class="segments" role="radiogroup" aria-labelledby="bulk-share-label" tabindex="-1" onkeydown={onShareKey}>
      {#each BULK_SHARES as option (option)}
        <button
          type="button"
          role="radio"
          class="segment"
          aria-checked={option === share}
          tabindex={option === share ? 0 : -1}
          onclick={() => (bulkShare.value = option)}
        >
          {t('bulk.share', { percent: percent(option) })}
        </button>
      {/each}
    </div>
    <!-- Wider screens: the scandal line beside the share choice, in its reserved slot. -->
    <div class="scandal-wide"><ScandalLine /></div>
  </div>
  <div class="table" style:--buyers={BUYERS.length} style:--columns={columns} style:--bar-height="{Math.max(0, barHeight - 6)}px">
    <div class="row header">
      <div class="corner"></div>
      {#each BUYERS as buyer (buyer.id)}
        <div class="who">
          <ArtSlot kind="buyer" id={buyer.id} size="md" />
          <div class="who-text">
            <h3>{t(`bulk.${buyer.id}.name`)}</h3>
            <p class="line" title={t(`bulk.${buyer.id}.line`)}>{t(`bulk.${buyer.id}.line`)}</p>
            <p class="caption">{t('bulk.perUnitCaption')}</p>
          </div>
        </div>
      {/each}
    </div>
    {#each rows as row (row.kind === 'chain' ? `chain-${row.chain}` : row.resource)}
      {#if row.kind === 'chain'}
        <div class="chain"><h4>{t(`chain.${row.chain}`)}</h4></div>
      {:else}
        {@const resource = row.resource}
        <div class="row">
          <div class="resource">
            <ArtSlot kind="resource" id={resource} size="sm" />
            <span class="name">{t(`resource.${resource}`)}</span>
            <small class="stock">{t('bulk.stock', { count: row.stock })}</small>
          </div>
          {#each BUYERS as buyer, index (buyer.id)}
            {@const offer = row.offers[index]}
            {#if offer}
              <BulkOfferCell
                buyer={buyer.id}
                {resource}
                {share}
                feeds={buyer.feedCost !== undefined}
                {offer}
                recovered={RECOVERED}
                onsell={() => sell(buyer.id, resource)}
              />
            {:else if buyer.id === 'megaMeat' && isProduct(resource)}
              <div class="none" title={t('bulk.noProducts')}>
                <span aria-hidden="true">–</span><span class="visually-hidden">{t('bulk.noProducts')}</span>
              </div>
            {:else}
              <div class="none"><span aria-hidden="true">–</span></div>
            {/if}
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</section>

<style>
  p {
    margin: 0;
  }

  .muted {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  /*
   * Stays in view while the rows scroll past, on an opaque bar. top: -8px undoes the tab's top
   * padding (8px, App.svelte), so no row or chain label shows in the strip above the bar.
   */
  .shares {
    position: sticky;
    top: -8px;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    padding: 14px 0 6px;
    margin-top: -8px;
    background: var(--paper);
    box-shadow: 0 1px 0 var(--line);
  }

  .shares-label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .scandal-wide {
    flex: 1 1 16rem;
    min-width: 0;
  }

  .scandal-narrow {
    display: none;
  }

  .segments {
    display: inline-flex;
    border: 1.4px solid var(--ink);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .segment {
    min-width: 64px;
    min-height: 44px;
    padding: 4px 12px;
    border: none;
    background: var(--paper);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    touch-action: manipulation;
  }

  .segment + .segment {
    border-left: 1.4px solid var(--ink);
  }

  .segment:hover:not([aria-checked='true']) {
    background: var(--paper-2);
  }

  .segment[aria-checked='true'] {
    background: var(--leaf);
    color: var(--on-leaf);
  }

  .segment:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: -4px;
  }

  /* One grid for the whole table: the resource, then one column per buyer; rows are subgrids. */
  .table {
    display: grid;
    grid-template-columns: var(--columns);
    column-gap: 8px;
  }

  .row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
    padding: 2px 0;
  }

  /*
   * Rows and chain labels snap to just below the sticky bar when a scroll ends near them (the tab
   * snaps with proximity, App.svelte), and keyboard focus scrolls them there too, so the bar
   * never ends up covering part of the row below it.
   */
  .row:not(.header),
  .chain {
    scroll-snap-align: start;
    scroll-margin-top: var(--bar-height);
  }

  .row:not(.header) {
    border-top: 1px solid var(--paper-2);
  }

  .header {
    align-items: end;
    padding-bottom: 4px;
  }

  .who {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .who-text {
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* One line; the full line is the tooltip. */
  .line {
    overflow: hidden;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-style: italic;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .caption {
    color: var(--ink-muted);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Chain labels, styled like the rail's stock groups, across every column. */
  .chain {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--line);
  }

  .chain h4 {
    margin: 0;
    color: var(--ink-muted);
    font-family: var(--font-ui);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .chain + .row {
    border-top: none;
  }

  .resource {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: 'art name' 'art stock';
    align-items: center;
    column-gap: 6px;
    min-width: 0;
    font-size: 0.9rem;
    line-height: 1.2;
  }

  .resource :global(.slot) {
    grid-area: art;
  }

  .name {
    grid-area: name;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .stock {
    grid-area: stock;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .none {
    display: grid;
    place-items: center;
    color: var(--text-muted);
  }

  /* Below 1280 px the cells have two small lines, so the rows lose their padding. */
  @media (max-width: 1279px) {
    .row {
      padding: 0;
    }
  }

  /* Below 1024 px: the resource line on top, the buyer cells side by side below. */
  @media (max-width: 1023px) {
    .table {
      grid-template-columns: repeat(var(--buyers), minmax(0, 1fr));
    }

    .corner,
    .caption {
      display: none;
    }

    .row {
      row-gap: 1px;
      align-items: stretch;
    }

    .resource {
      grid-column: 1 / -1;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas: 'art name stock';
      font-size: 0.85rem;
      line-height: 1.15;
    }

    .resource :global(.slot) {
      width: 16px;
      height: 16px;
    }

    /* Room for the stock to grow without squeezing the name. */
    .stock {
      min-width: 12ch;
      text-align: right;
    }
  }

  /* Phones: the scandal line above the bar, which stays one line tall. */
  @media (max-width: 767px) {
    .scandal-narrow {
      display: block;
    }

    .scandal-wide {
      display: none;
    }

    .who :global(.slot) {
      display: none;
    }
  }
</style>
