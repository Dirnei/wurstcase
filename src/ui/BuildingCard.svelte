<script lang="ts">
  import { getBuilding, type BuildingId } from '../game/content/buildings'
  import { MANUAL_ACTIONS } from '../game/content/manual'
  import { buildingPrice, buyBuilding, canBuy, isUnlocked } from '../game/systems/buildings'
  import { canPerform, performManual } from '../game/systems/manual'
  import { nextMilestone, outputFactor } from '../game/systems/ownedMilestones'
  import { amount, euros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { pop } from './motion/pop'

  let { id }: { id: BuildingId } = $props()

  // Above one unit per tick the bar would only flicker, so it just shows full.
  const STEADY_UNITS_PER_SECOND = 10

  const building = $derived(getBuilding(id))
  const manual = $derived(MANUAL_ACTIONS.find((action) => action.building === id)!)
  const unlocked = $derived(readGame((state) => isUnlocked(state, id)))
  const owned = $derived(readGame((state) => state.buildings[id]))
  const rate = $derived(building.rate * readGame((state) => outputFactor(state, id)))
  const milestone = $derived(nextMilestone(owned))
  const price = $derived(euros(readGame((state) => buildingPrice(state, id))))
  const affordable = $derived(readGame((state) => canBuy(state, id)))
  const performable = $derived(readGame((state) => canPerform(state, manual.id)))
  let pops = $state(0)

  function buy() {
    let bought = false
    act((state) => (bought = buyBuilding(state, id)))
    if (bought) pops++
  }

  const filled = $derived(
    owned * rate > STEADY_UNITS_PER_SECOND ? 1 : readGame((state) => Math.min(state.progress[id], 1)),
  )
</script>

<article class="building card" class:locked={!unlocked} use:pop={pops}>
  <ArtSlot kind="building" {id} size="lg" />
  <div class="head">
    <h3>{t(`building.${id}`)}</h3>
    {#if unlocked}
      <span class="count" title={t('building.owned', { count: owned })}>{t('building.count', { count: owned })}</span>
    {/if}
  </div>
  {#if unlocked}
    <p class="rate">
      {t('building.perSecond', { amount: amount(owned * rate), resource: t(`resource.${building.output}`) })}
      {#if milestone}
        · <span class="milestone">{t('building.nextMilestone', { factor: milestone.factor, count: milestone.at })}</span>
      {/if}
    </p>
    {#if building.input}
      <p class="recipe">
        {t('recipe', {
          inAmount: amount(building.input.ratio),
          input: t(`resource.${building.input.resource}`),
          outAmount: amount(1),
          output: t(`resource.${building.output}`),
        })}
      </p>
    {:else}
      <!-- Fields have no recipe; the empty line keeps their buttons level with the rest of the row. -->
      <p class="recipe" aria-hidden="true">&nbsp;</p>
    {/if}
    <div class="bar" aria-hidden="true"><div style:width="{filled * 100}%"></div></div>
    <div class="actions">
      <button
        type="button"
        class="game-button hand"
        aria-label={t(`manual.${manual.id}`)}
        title={t(`manual.${manual.id}`)}
        disabled={!performable}
        onclick={() => act((state) => performManual(state, manual.id))}
      >
        {t('building.byHand')}
      </button>
      <button
        type="button"
        class="game-button primary buy"
        disabled={!affordable}
        onclick={buy}
      >
        {t('building.buy', { price })}
      </button>
    </div>
  {:else}
    <p class="rate">{t('locked.at', { amount: euros(building.unlockAt) })}</p>
  {/if}
</article>

<style>
  .building {
    position: relative;
    display: grid;
    grid-template-columns: 48px 1fr;
    grid-auto-rows: auto;
    column-gap: 10px;
    row-gap: 0;
    align-content: start;
    padding: 6px 10px 8px;
    min-width: 0;
  }

  .building > :global(.slot) {
    grid-row: 1 / span 3;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.25;
  }

  .milestone {
    font-weight: 800;
  }

  .count {
    color: var(--ink-muted);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  p {
    margin: 0;
    color: var(--ink-muted);
    font-size: 0.78rem;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
  }

  .bar,
  .actions {
    grid-column: 1 / -1;
  }

  .bar {
    height: 6px;
    margin-top: 4px;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--paper-2);
    overflow: hidden;
  }

  .bar > div {
    height: 100%;
    background: var(--leaf);
  }

  .actions {
    display: flex;
    gap: 6px;
    margin-top: 5px;
  }

  .actions .game-button {
    min-height: 30px;
    padding-block: 2px;
  }

  .buy {
    flex: 1;
  }

  .locked {
    border-style: dashed;
    border-color: var(--ink-muted);
    background: transparent;
    opacity: 0.75;
  }

  .locked > :global(.slot) {
    grid-row: 1 / span 2;
    filter: grayscale(0.7);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .actions {
      flex-wrap: wrap;
    }

    .actions .game-button {
      flex: 1 1 auto;
      text-align: center;
    }
  }

  @media (max-width: 767px) {
    .actions .game-button {
      min-height: 44px;
    }
  }
</style>
