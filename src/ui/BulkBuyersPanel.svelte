<script lang="ts">
  import { BULK_SHARES, BUYERS, type BuyerId } from '../game/content/buyers'
  import { CHAIN_RESOURCES, type ChainId } from '../game/content/buildings'
  import { PRODUCTS, type ResourceId } from '../game/content/resources'
  import {
    bulkSaleCost,
    bulkSaleUnits,
    bulkSaleValue,
    bulkSell,
    canBulkSell,
    hasLot,
    isFlooded,
    lotFor,
    marketLevel,
    timeToRecover,
  } from '../game/systems/bulkSales'
  import { getBuyer } from '../game/content/buyers'
  import { isResourceShown } from '../game/systems/buildings'
  import { amount, euros, liveCount, liveEuros } from './amounts'
  import { act, readGame } from './game.svelte'
  import ArtSlot from './ArtSlot.svelte'
  import ScandalLine from './ScandalLine.svelte'
  import { t } from './i18n.svelte'

  type Row = { kind: 'chain'; chain: ChainId } | { kind: 'resource'; resource: ResourceId }

  /**
   * The rows both cards share: per chain, a heading and then every resource any buyer offers, in
   * production order; chains with nothing to offer are left out. Planned across the buyers, so row n
   * means the same in every card, and a buyer without an offer in a row keeps it as a placeholder.
   */
  const rows = $derived(
    readGame((state) =>
      CHAIN_RESOURCES.flatMap(({ chain, resources }): Row[] => {
        const offered = resources.filter(
          (resource) => isResourceShown(state, resource) && BUYERS.some((buyer) => hasLot(buyer.id, resource)),
        )
        return offered.length === 0
          ? []
          : [{ kind: 'chain', chain }, ...offered.map((resource): Row => ({ kind: 'resource', resource }))]
      }),
    ),
  )

  const buyers = $derived(
    readGame((state) =>
      BUYERS.map((buyer) => ({
        id: buyer.id,
        feeds: buyer.feedCost !== undefined,
        offers: rows.flatMap((row) =>
          row.kind === 'resource' && hasLot(buyer.id, row.resource) ? [row.resource] : [],
        ).map((resource) => ({
          resource,
          lot: lotFor(state, buyer.id, resource)!,
          // One sale per share, each priced as if it were the only one (MegaMeat: along its flood).
          sales: BULK_SHARES.map((share) => ({
            share,
            sellable: canBulkSell(state, buyer.id, resource, share),
            units: bulkSaleUnits(state, buyer.id, resource, share),
            value: bulkSaleValue(state, buyer.id, resource, share),
            cost: bulkSaleCost(state, buyer.id, resource, share),
          })),
          // Only a flooded market has a level; its lot price would only show the fresh price.
          market: isFlooded(buyer.id, resource)
            ? { level: marketLevel(state, resource, buyer.id), recover: timeToRecover(state, resource, RECOVERED, buyer.id) }
            : null,
        })),
      })),
    ),
  )

  // The cards share the rows of one grid: a header row, then the planned rows.
  const offerRows = $derived(Math.max(1, rows.length))

  /** The market level the recovery time counts down to. */
  const RECOVERED = 0.95

  /** Game seconds as m:ss. */
  function clock(seconds: number): string {
    const whole = Math.ceil(seconds)
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
  }

  function sell(buyer: BuyerId, resource: ResourceId, share: number) {
    act((state) => bulkSell(state, buyer, resource, share))
  }

  const percent = (share: number) => Math.round(share * 100)
</script>

<section class="panel">
  <h2>{t('bulk.title')}</h2>
  <p class="muted">{t('bulk.hint')}</p>
  <ScandalLine />
  <div class="buyers">
    {#each buyers as buyer (buyer.id)}
      <div class="buyer card" style:grid-row="span {offerRows + 1}">
        <div class="who">
          <ArtSlot kind="buyer" id={buyer.id} size="lg" />
          <div>
            <h3>{t(`bulk.${buyer.id}.name`)}</h3>
            <p class="line">{t(`bulk.${buyer.id}.line`)}</p>
          </div>
        </div>
        <ul style:grid-row="span {offerRows}">
          {#each rows as row (row.kind === 'chain' ? `chain-${row.chain}` : row.resource)}
            {#if row.kind === 'chain'}
              <li class="chain"><h4>{t(`chain.${row.chain}`)}</h4></li>
            {:else}
              {@const offer = buyer.offers.find((candidate) => candidate.resource === row.resource)}
              {#if offer}
                <li>
                  <div class="head">
                    <ArtSlot kind="resource" id={offer.resource} size="sm" />
                    <span class="resource">{t(`resource.${offer.resource}`)}</span>
                    <small class="lot">
                      {offer.market
                        ? t('bulk.lotSize', { units: amount(offer.lot.units) })
                        : t('bulk.lot', { units: amount(offer.lot.units), price: euros(offer.lot.price) })}
                    </small>
                  </div>
                  {#if offer.market}
                    <!-- Fixed tracks, so the recovering market only changes digits and the meter's fill. -->
                    <small class="market">
                      <span>{t('bulk.market', { percent: Math.floor(offer.market.level * 100) })}</span>
                      <span class="meter" aria-hidden="true"><span style:width="{offer.market.level * 100}%"></span></span>
                      <span class="recover">
                        {offer.market.recover > 0 ? t('bulk.recover', { percent: Math.round(RECOVERED * 100), time: clock(offer.market.recover) }) : ''}
                      </span>
                    </small>
                  {/if}
                  <div class="shares">
                    {#each offer.sales as sale (sale.share)}
                      <button
                        type="button"
                        class="game-button share"
                        disabled={!sale.sellable}
                        aria-label={sale.sellable
                          ? t('bulk.sellShare', {
                              percent: percent(sale.share),
                              resource: t(`resource.${offer.resource}`),
                              buyer: t(`bulk.${buyer.id}.name`),
                              units: amount(sale.units),
                              price: euros(sale.value),
                            }) + (buyer.feeds ? `, ${t('bulk.cost', { awareness: sale.cost.awareness, percent: sale.cost.scandalLoss })}` : '')
                          : t('bulk.sellShareNone', { percent: percent(sale.share), resource: t(`resource.${offer.resource}`) })}
                        onclick={() => sell(buyer.id, offer.resource, sale.share)}
                      >
                        <span class="pct">{t('bulk.share', { percent: percent(sale.share) })}</span>
                        <!-- Units and price on lines of their own, so a growing value never re-wraps; a dash keeps the size. -->
                        <span class="units">{sale.sellable ? `${liveCount(sale.units)} →` : '–'}</span>
                        <span class="price">{sale.sellable ? liveEuros(sale.value) : ''}</span>
                        {#if buyer.feeds}
                          <!-- Reserved whether or not the sale costs anything. -->
                          <span class="cost">
                            {#if sale.sellable && (sale.cost.awareness > 0 || sale.cost.scandalLoss > 0)}
                              <span class="pair">−{amount(sale.cost.awareness)}<ArtSlot kind="stat" id="awareness" size="sm" /></span>
                              <!-- How many percent less customers would order and campaigns would win after this sale. -->
                              <span class="pair" title={t('bulk.scandalLoss', { percent: sale.cost.scandalLoss })}
                                >−{sale.cost.scandalLoss} %<ArtSlot kind="misc" id="megaMeatMark" size="sm" /></span
                              >
                            {/if}
                          </span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                </li>
              {:else}
                <!-- This buyer does not take the resource; the row stays so both cards line up. -->
                <li class="none">
                  {#if buyer.id === 'megaMeat' && PRODUCTS.includes(row.resource as (typeof PRODUCTS)[number])}
                    <small>{t('bulk.noProducts')}</small>
                  {/if}
                </li>
              {/if}
            {/if}
          {/each}
        </ul>
      </div>
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

  /* Cards side by side share these rows through subgrid, so the same resource lines up. */
  .buyers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  .buyer {
    display: grid;
    grid-template-rows: subgrid;
    row-gap: 6px;
    align-content: start;
    padding: 10px;
  }

  .who {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .line {
    font-size: 0.875rem;
    font-style: italic;
    color: var(--text-muted);
  }

  ul {
    display: grid;
    grid-template-rows: subgrid;
    align-content: start;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Each offer is a full-width row, so a changing price only moves digits in its value cell. */
  li {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* Chain labels, styled like the rail's stock groups. */
  .chain {
    justify-content: end;
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

  .chain:not(:first-child) {
    margin-top: 4px;
    padding-top: 6px;
    border-top: 1px solid var(--line);
  }

  .none small {
    font-style: italic;
  }

  small {
    color: var(--text-muted);
  }

  .market {
    display: grid;
    grid-template-columns: 11ch 1fr 11ch;
    align-items: center;
    gap: 6px;
    font-variant-numeric: tabular-nums;
  }

  .meter {
    height: 4px;
    border-radius: 2px;
    background: var(--paper-2);
    outline: 1px solid var(--line);
    overflow: hidden;
  }

  .meter > span {
    display: block;
    height: 100%;
    background: var(--danger);
  }

  .recover {
    text-align: right;
  }


  .head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 6px;
  }

  .resource {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .lot {
    white-space: nowrap;
  }

  /* Three equal columns, whatever the values in them. */
  .shares {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .share {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
    padding: 4px 4px;
    line-height: 1.25;
    font-variant-numeric: tabular-nums;
  }

  .pct {
    font-weight: 800;
  }

  .units,
  .price {
    min-height: 1.25em;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* Pairs of amount and icon wrap as a whole; phones reserve a second line, so the button never grows. */
  .cost {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    gap: 0 4px;
    min-height: 18px;
    color: var(--danger);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .pair {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    white-space: nowrap;
  }

  .pair :global(.slot) {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 767px) {
    .cost {
      min-height: 36px;
    }
  }
</style>
