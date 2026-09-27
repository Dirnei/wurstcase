<script lang="ts">
  import { BUYERS, type BuyerId } from '../game/content/buyers'
  import { RESOURCES, type ResourceId } from '../game/content/resources'
  import { bulkSaleUnits, bulkSaleValue, bulkSell, canBulkSell } from '../game/systems/bulkSales'
  import { isResourceShown } from '../game/systems/buildings'
  import { amount, euros } from './amounts'
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
        })),
      })),
    ),
  )

  function sell(buyer: BuyerId, resource: ResourceId) {
    act((state) => bulkSell(state, buyer, resource))
  }
</script>

<section class="panel">
  <h2>{t('bulk.title')}</h2>
  <p class="muted">{t('bulk.hint')}</p>
  <div class="buyers">
    {#each buyers as buyer (buyer.id)}
      <div class="buyer card">
        <div class="who">
          <ArtSlot kind="buyer" id={buyer.id} size="lg" />
          <div>
            <h3>{t(`bulk.${buyer.id}.name`)}</h3>
            <p class="line">{t(`bulk.${buyer.id}.line`)}</p>
          </div>
        </div>
        <ul>
          {#each buyer.offers as offer (offer.resource)}
            <li>
              <button
                type="button"
                class="game-button"
                disabled={!offer.sellable}
                onclick={() => sell(buyer.id, offer.resource)}
              >
                <ArtSlot kind="resource" id={offer.resource} size="sm" />
                {offer.sellable
                  ? t('bulk.sell', {
                      units: amount(offer.units),
                      resource: t(`resource.${offer.resource}`),
                      price: euros(offer.value),
                    })
                  : t(`resource.${offer.resource}`)}
              </button>
              <small>{t('bulk.lot', { units: amount(offer.lot.units), price: euros(offer.lot.price) })}</small>
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

  .buyers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }

  .buyer {
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  small {
    color: var(--text-muted);
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-variant-numeric: tabular-nums;
  }
</style>
