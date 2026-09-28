<script lang="ts">
  import { BUYERS, type BuyerId } from '../game/content/buyers'
  import { RESOURCES, type ResourceId } from '../game/content/resources'
  import {
    bulkSaleCost,
    bulkSaleUnits,
    bulkSaleValue,
    bulkSell,
    canBulkSell,
    hasLot,
    lotFor,
    marketLevel,
    timeToRecover,
  } from '../game/systems/bulkSales'
  import { getBuyer } from '../game/content/buyers'
  import { isResourceShown } from '../game/systems/buildings'
  import { amount, euros, liveAmount, liveEuros } from './amounts'
  import { act, readGame } from './game.svelte'
  import ArtSlot from './ArtSlot.svelte'
  import { t } from './i18n.svelte'

  const buyers = $derived(
    readGame((state) =>
      BUYERS.map((buyer) => ({
        id: buyer.id,
        offers: RESOURCES.filter(
          (resource) => hasLot(buyer.id, resource) && isResourceShown(state, resource),
        ).map((resource) => ({
          resource,
          lot: lotFor(state, buyer.id, resource)!,
          sellable: canBulkSell(state, buyer.id, resource),
          units: bulkSaleUnits(state, buyer.id, resource),
          value: bulkSaleValue(state, buyer.id, resource),
          cost: bulkSaleCost(state, buyer.id, resource),
          // Only a flooded market (MegaMeat) has a level; its lot price would only show the full price.
          market: getBuyer(buyer.id).flood
            ? { level: marketLevel(state, resource), recover: timeToRecover(state, resource, RECOVERED) }
            : null,
        })),
      })),
    ),
  )

  // The cards share the rows of one grid: a header row, then one row per offer of the longest list.
  const offerRows = $derived(Math.max(1, ...buyers.map((buyer) => buyer.offers.length)))

  /** The market level the recovery time counts down to. */
  const RECOVERED = 0.95

  /** Game seconds as m:ss. */
  function clock(seconds: number): string {
    const whole = Math.ceil(seconds)
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
  }

  function sell(buyer: BuyerId, resource: ResourceId) {
    act((state) => bulkSell(state, buyer, resource))
  }
</script>

<section class="panel">
  <h2>{t('bulk.title')}</h2>
  <p class="muted">{t('bulk.hint')}</p>
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
          {#each buyer.offers as offer (offer.resource)}
            <li>
              <button
                type="button"
                class="game-button offer"
                disabled={!offer.sellable}
                onclick={() => sell(buyer.id, offer.resource)}
              >
                <ArtSlot kind="resource" id={offer.resource} size="sm" />
                <span class="resource">{t(`resource.${offer.resource}`)}</span>
                <!-- A dash keeps the button's layout while nothing can be sold. -->
                <span class="value">
                  {offer.sellable
                    ? t('bulk.sellValue', { units: liveAmount(offer.units), price: liveEuros(offer.value) })
                    : '–'}
                </span>
              </button>
              {#if offer.market}
                <!-- Fixed tracks, so the recovering market only changes digits and the meter's fill. -->
                <small class="market">
                  <span>{t('bulk.market', { percent: Math.floor(offer.market.level * 100) })}</span>
                  <span class="meter" aria-hidden="true"><span style:width="{offer.market.level * 100}%"></span></span>
                  <span class="recover">
                    {offer.market.recover > 0 ? t('bulk.recover', { percent: Math.round(RECOVERED * 100), time: clock(offer.market.recover) }) : ''}
                  </span>
                </small>
                <small>
                  {#if offer.cost.customers > 0 || offer.cost.awareness > 0}
                    <span class="cost">{t('bulk.cost', { customers: offer.cost.customers, awareness: offer.cost.awareness })}</span>
                  {:else}
                    {t('bulk.lotSize', { units: amount(offer.lot.units) })}
                  {/if}
                </small>
              {:else}
                <small>
                  {t('bulk.lot', { units: amount(offer.lot.units), price: euros(offer.lot.price) })}
                  {#if offer.cost.customers > 0}
                    · <span class="cost">{t('bulk.cost', { customers: offer.cost.customers, awareness: offer.cost.awareness })}</span>
                  {/if}
                </small>
              {/if}
            </li>
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

  .cost {
    color: var(--danger);
    font-weight: 600;
  }

  .offer {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 6px;
    width: 100%;
    text-align: left;
  }

  .resource {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .value {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
</style>
