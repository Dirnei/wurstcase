<script lang="ts">
  import { BUYERS, type BuyerId } from '../game/content/buyers'
  import { RESOURCES, type ResourceId } from '../game/content/resources'
  import { bulkSaleCost, bulkSaleUnits, bulkSaleValue, bulkSell, canBulkSell } from '../game/systems/bulkSales'
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
          (resource) => buyer.lots[resource] !== undefined && isResourceShown(state, resource),
        ).map((resource) => ({
          resource,
          lot: buyer.lots[resource]!,
          sellable: canBulkSell(state, buyer.id, resource),
          units: bulkSaleUnits(state, buyer.id, resource),
          value: bulkSaleValue(state, buyer.id, resource),
          cost: bulkSaleCost(state, buyer.id, resource),
        })),
      })),
    ),
  )

  // The cards share the rows of one grid: a header row, then one row per offer of the longest list.
  const offerRows = $derived(Math.max(1, ...buyers.map((buyer) => buyer.offers.length)))

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
              <small>
                {t('bulk.lot', { units: amount(offer.lot.units), price: euros(offer.lot.price) })}
                {#if offer.cost.customers > 0}
                  · <span class="cost">{t('bulk.cost', { customers: offer.cost.customers, awareness: offer.cost.awareness })}</span>
                {/if}
              </small>
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
