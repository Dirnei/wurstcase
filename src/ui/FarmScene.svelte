<script lang="ts">
  import { SPECIES, type SpeciesId } from '../game/content/animals'
  import { SHELTERS } from '../game/content/shelters'
  import { amount } from './amounts'
  import { SHELTER_ART, SPECIES_ART } from './art'
  import { FARM_SLOTS, farmFigures } from './art/farmSlots'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  // Width of each figure as a share of the scene, so bigger animals look bigger.
  const FIGURE_WIDTH: Record<SpeciesId, number> = { chicken: 6, pig: 8, cow: 10 }
  const SHELTER_WIDTH = 9

  const residents = $derived(readGame((state) => state.residents.map((resident) => resident.species)))
  const scene = $derived(farmFigures(residents.length))
  const shelters = $derived(
    readGame((state) => SHELTERS.flatMap((shelter) => Array.from({ length: state.shelters[shelter.id] }, () => shelter.id))),
  )
  // Shelters stand along the back of the meadow, closer together the more there are.
  const shelterStep = $derived(Math.min(SHELTER_WIDTH + 1, 24 / Math.max(shelters.length, 1)))
  const summary = $derived(
    SPECIES.map((species) => ({ id: species.id, count: residents.filter((r) => r === species.id).length }))
      .filter((group) => group.count > 0)
      .map((group) => t(`farm.${group.id}.${group.count === 1 ? 'one' : 'other'}`, { count: amount(group.count) }))
      .join(', '),
  )
</script>

<figure class="farm">
  <div class="stage" aria-hidden="true">
    <svg class="art ground" viewBox="0 0 640 200" preserveAspectRatio="none" focusable="false">
      <rect class="f-sky-bottom no-stroke" width="640" height="200" />
      <path class="f-hill-1" d="M0 70 Q160 30 330 60 T640 50 V200 H0 Z" />
      <path class="f-hill-2" d="M0 110 Q200 80 420 100 T640 95 V200 H0 Z" />
      <path class="detail thin s-leaf-dark" d="M40 150 l4 -8 l4 8 M180 175 l4 -8 l4 8 M520 160 l4 -8 l4 8 M600 185 l4 -8 l4 8" />
    </svg>
    {#each shelters as shelter, i (i)}
      {@const Art = SHELTER_ART[shelter]}
      <span class="item" style:left="{2 + i * shelterStep + SHELTER_WIDTH / 2}%" style:top="{46 + (i % 2) * 8}%" style:width="{SHELTER_WIDTH}%">
        <Art />
      </span>
    {/each}
    {#each scene.drawOrder as index (index)}
      {@const species = residents[index]}
      {@const Art = SPECIES_ART[species]}
      <span
        class="item figure"
        style:left="{FARM_SLOTS[index].x}%"
        style:top="{FARM_SLOTS[index].y}%"
        style:width="{FIGURE_WIDTH[species]}%"
        style:--i={index}
      >
        <Art />
      </span>
    {/each}
    {#if scene.more > 0}
      <span class="more">{t('farm.more', { count: amount(scene.more) })}</span>
    {/if}
  </div>
  {#if summary}
    <figcaption class="visually-hidden">{t('farm.label', { residents: summary })}</figcaption>
  {/if}
</figure>

<style>
  .farm {
    margin: 0;
  }

  .stage {
    position: relative;
    aspect-ratio: 640 / 200;
    max-height: 220px;
    width: 100%;
    overflow: hidden;
    border: 1.4px solid var(--ink);
    border-radius: 10px;
  }

  .ground {
    position: absolute;
    inset: 0;
  }

  .item {
    position: absolute;
    aspect-ratio: 1;
    transform: translate(-50%, -100%);
  }

  .more {
    position: absolute;
    right: 8px;
    bottom: 6px;
    padding: 0 8px;
    border: 1.4px solid var(--ink);
    border-radius: 999px;
    background: var(--paper);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
</style>
