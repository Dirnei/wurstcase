<script lang="ts">
  import { getBuilding, type BuildingId } from '../game/content/buildings'
  import { MANUAL_ACTIONS } from '../game/content/manual'
  import { buildingPrice, buyBuilding, canBuy, isUnlocked } from '../game/systems/buildings'
  import { canPerform, manualUnits, performManual } from '../game/systems/manual'
  import { storeroomRoom } from '../game/systems/storeroom'
  import { rateFactor, yieldPerRun } from '../game/systems/upgrades'
  import { amount, euros, liveCount } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import FloatingAmount from './FloatingAmount.svelte'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { expire, FLOAT_MS, push, type Float } from './motion/floats'
  import { flash, pop } from './motion/pop'
  import { prefersReducedMotion } from './motion/reducedMotion.svelte'

  let { id }: { id: BuildingId } = $props()

  // Above one unit per tick the bar would only flicker, so it just shows full.
  const STEADY_UNITS_PER_SECOND = 10

  const building = $derived(getBuilding(id))
  const manual = $derived(MANUAL_ACTIONS.find((action) => action.building === id)!)
  const unlocked = $derived(readGame((state) => isUnlocked(state, id)))
  const owned = $derived(readGame((state) => state.buildings[id]))
  const perRun = $derived(readGame((state) => yieldPerRun(state, id)))
  const rate = $derived(building.rate * readGame((state) => rateFactor(state, id)) * perRun)
  const price = $derived(euros(readGame((state) => buildingPrice(state, id))))
  const affordable = $derived(readGame((state) => canBuy(state, id)))
  const performable = $derived(readGame((state) => canPerform(state, manual.id)))
  const stockCount = $derived(readGame((state) => state.stock[building.output]))
  const room = $derived(readGame(storeroomRoom))
  const fill = $derived(Math.min(stockCount.div(room).toNumber(), 1))
  const full = $derived(readGame((state) => state.full[building.output] !== undefined))
  // Only a lack of input disables a processing step's by-hand button; a full output has its own mark.
  const inputShort = $derived(
    building.input !== undefined &&
      readGame((state) => state.stock[building.input!.resource].lt(building.input!.ratio)),
  )
  let pops = $state(0)
  let floats = $state<Float[]>([])
  // Counts clicks for the reduced-motion highlight of the stock figure.
  let made = $state(0)

  function byHand() {
    let units = 0
    act((state) => {
      units = manualUnits(state, manual.id)
      if (!performManual(state, manual.id)) units = 0
    })
    if (units <= 0) return
    if (prefersReducedMotion()) {
      made++
      return
    }
    floats = push(floats, `+${amount(units)}`, performance.now())
    setTimeout(() => (floats = expire(floats, performance.now())), FLOAT_MS + 50)
  }

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
    </p>
    {#if building.input}
      <p class="recipe">
        <!-- The mark's slot is always there, so the line never reflows when the input runs short. -->
        <span class="input" class:short={inputShort} title={inputShort ? t('recipe.short') : undefined}>
          <span class="mark" aria-hidden="true">!</span>{amount(building.input.ratio)}
          {t(`resource.${building.input.resource}`)}
          {#if inputShort}<span class="visually-hidden">({t('recipe.short')})</span>{/if}
        </span>
        → {amount(perRun)} {t(`resource.${building.output}`)}
      </p>
    {:else}
      <!-- Fields have no recipe; the empty line keeps their buttons level with the rest of the row. -->
      <p class="recipe" aria-hidden="true">&nbsp;</p>
    {/if}
    <p class="stock">
      <span class="stock-label">{t('building.stock')}</span>
      <span class="figure" use:flash={made}>{liveCount(stockCount)}</span>
      <span aria-hidden="true">/</span>
      <span class="figure">{liveCount(room)}</span>
      <span class="meter" aria-hidden="true"><span style:width="{fill * 100}%"></span></span>
      <span class="full-slot">
        {#if full}
          <span class="badge" title={t('stock.full')}><span aria-hidden="true">{t('stock.fullBadge')}</span></span>
          <span class="visually-hidden">({t('stock.full')})</span>
        {/if}
      </span>
    </p>
    <div class="bar" aria-hidden="true"><div style:width="{filled * 100}%"></div></div>
    <div class="actions">
      <span class="hand-wrap">
        <button
          type="button"
          class="game-button hand"
          aria-label={t(`manual.${manual.id}`)}
          title={t(`manual.${manual.id}`)}
          disabled={!performable}
          onclick={byHand}
        >
          {t(`manual.${manual.id}.verb`)}
        </button>
        <FloatingAmount {floats} art={{ kind: 'resource', id: building.output }} />
      </span>
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
    padding: 4px 10px 6px;
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

  .stock,
  .bar,
  .actions {
    grid-column: 1 / -1;
  }

  /* Fixed tracks: a figure that grows only changes digits inside its own slot. */
  .stock {
    display: grid;
    grid-template-columns: auto 9ch auto 9ch 1fr 4.5em;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .figure {
    text-align: right;
    font-weight: 700;
    color: var(--ink);
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
    background: var(--ink-muted);
  }

  .full-slot {
    text-align: right;
  }

  .badge {
    padding: 0 4px;
    border: 1.2px solid currentColor;
    border-radius: var(--radius-sm);
    color: var(--danger);
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .input .mark {
    display: inline-block;
    width: 0.7em;
    font-weight: 800;
    visibility: hidden;
  }

  .input.short {
    color: var(--danger);
    font-weight: 700;
  }

  .input.short .mark {
    visibility: visible;
  }

  .hand-wrap {
    position: relative;
    display: grid;
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

  /* Every verb gets the same width, so the Buy buttons start at the same place on every card;
     sized for the longest one, "Schäumen". */
  .hand {
    min-width: 6.5em;
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
    /* Narrow cards: the label goes (screen readers keep it) so the meter stays visible. */
    .stock-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }

    .actions {
      flex-wrap: wrap;
    }

    .actions .game-button,
    .hand-wrap {
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
