<script lang="ts">
  import { BUILDINGS, CHAINS } from '../game/content/buildings'
  import { isUnlocked, nextLockedBuildings } from '../game/systems/buildings'
  import BuildingCard from './BuildingCard.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  // Per chain: the unlocked buildings plus the ones that unlock next, in production order.
  const rows = $derived(
    readGame((state) => {
      const next = nextLockedBuildings(state)
      return CHAINS.map((chain) => ({
        chain,
        buildings: BUILDINGS.filter(
          (building) => building.chain === chain && (isUnlocked(state, building.id) || next.includes(building.id)),
        ).map((building) => building.id),
      })).filter((row) => row.buildings.length > 0)
    }),
  )
</script>

<h2 class="visually-hidden">{t('tab.produktion')}</h2>
{#each rows as row (row.chain)}
  <section class="chain" aria-labelledby="chain-{row.chain}">
    <h3 id="chain-{row.chain}">{t(`chain.${row.chain}`)}</h3>
    <div class="row">
      {#each row.buildings as id (id)}
        <BuildingCard {id} />
      {/each}
    </div>
  </section>
{/each}

<style>
  .chain + .chain {
    margin-top: 2px;
  }

  h3 {
    margin: 0 0 2px 2px;
    font-size: 0.85rem;
    line-height: 1.3;
    font-weight: 600;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px 18px;
  }

  /* The flow runs left to right: field, processing, product. */
  .row > :global(article + article)::before {
    content: '→';
    position: absolute;
    top: 22px;
    left: -15px;
    color: var(--ink-muted);
  }

  @media (max-width: 767px) {
    .row {
      grid-template-columns: minmax(0, 1fr);
    }

    .row > :global(article + article)::before {
      content: none;
    }
  }
</style>
