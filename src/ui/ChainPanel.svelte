<script lang="ts">
  import { BUILDINGS, type ChainId } from '../game/content/buildings'
  import { isUnlocked } from '../game/systems/buildings'
  import BuildingRow from './BuildingRow.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  let { chain }: { chain: ChainId } = $props()

  const shown = $derived(
    readGame((state) =>
      BUILDINGS.filter((building) => building.chain === chain && isUnlocked(state, building.id)),
    ),
  )
</script>

{#if shown.length > 0}
  <section class="panel">
    <h2>{t(`chain.${chain}`)}</h2>
    <ul>
      {#each shown as building (building.id)}
        <BuildingRow id={building.id} />
      {/each}
    </ul>
  </section>
{/if}

<style>
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
