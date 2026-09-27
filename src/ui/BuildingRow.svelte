<script lang="ts">
  import { getBuilding, type BuildingId } from '../game/content/buildings'
  import { buildingPrice, buyBuilding, canBuy } from '../game/systems/buildings'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  let { id }: { id: BuildingId } = $props()

  // Above one unit per tick the bar would only flicker, so it just shows full.
  const STEADY_UNITS_PER_SECOND = 10

  const building = $derived(getBuilding(id))
  const owned = $derived(readGame((state) => state.buildings[id]))
  const price = $derived(euros(readGame((state) => buildingPrice(state, id))))
  const affordable = $derived(readGame((state) => canBuy(state, id)))
  const filled = $derived(
    owned * building.rate > STEADY_UNITS_PER_SECOND
      ? 1
      : readGame((state) => Math.min(state.progress[id], 1)),
  )
</script>

<li>
  <div class="info">
    <strong>{t(`building.${id}`)}</strong>
    <span class="muted">{t('building.owned', { count: owned })}</span>
    <span class="muted">
      {t('building.perSecond', {
        amount: amount(owned * building.rate),
        resource: t(`resource.${building.output}`),
      })}
    </span>
    {#if building.input}
      <span class="muted">
        {t('recipe', {
          inAmount: amount(building.input.ratio),
          input: t(`resource.${building.input.resource}`),
          outAmount: amount(1),
          output: t(`resource.${building.output}`),
        })}
      </span>
    {/if}
    <!-- Always rendered, so buying the first copy does not change the row height. -->
    <div class="bar" aria-hidden="true"><div style:width="{filled * 100}%"></div></div>
  </div>
  <button
    type="button"
    class="game-button"
    disabled={!affordable}
    onclick={() => act((state) => buyBuilding(state, id))}
  >
    {t('building.buy', { price })}
  </button>
</li>

<style>
  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 0;
    border-top: 1px solid var(--border);
  }

  li:first-child {
    border-top: none;
  }

  .info {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 12px;
    min-width: 0;
  }

  .muted {
    color: var(--text-muted);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .bar {
    flex-basis: 100%;
    height: 4px;
    margin-top: 4px;
    border-radius: 2px;
    background: var(--border);
    overflow: hidden;
  }

  .bar > div {
    height: 100%;
    background: var(--accent);
  }

  button {
    font-variant-numeric: tabular-nums;
  }
</style>
