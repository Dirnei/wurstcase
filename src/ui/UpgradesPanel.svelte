<script lang="ts">
  import { getUpgrade, type UpgradeEffect, type UpgradeId } from '../game/content/upgrades'
  import { buyUpgrade, canBuyUpgrade, offeredUpgrades } from '../game/systems/upgrades'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import type { ArtKind } from './art'
  import ArtSlot from './ArtSlot.svelte'
  import { currentLang, t } from './i18n.svelte'
  import { pop } from './motion/pop'

  const offers = $derived(
    readGame((state) =>
      offeredUpgrades(state).map((upgrade) => ({ ...upgrade, affordable: canBuyUpgrade(state, upgrade.id) })),
    ),
  )
  const owned = $derived(readGame((state) => state.upgrades.map((id) => getUpgrade(id))))

  // Factors such as ×0.75 need two decimals, which the game's amount format would cut off.
  const factor = (value: number) => new Intl.NumberFormat(currentLang(), { maximumFractionDigits: 2 }).format(value)

  // The first thing an effect names, drawn next to the effect type.
  function target(effect: UpgradeEffect): { kind: ArtKind; id: string } | null {
    switch (effect.kind) {
      case 'rate':
        return { kind: 'building', id: effect.buildings[0] }
      case 'price':
        return { kind: 'resource', id: effect.product }
      case 'awareness':
        return { kind: 'species', id: effect.species }
      case 'space':
        return { kind: 'shelter', id: effect.shelter }
      default:
        return null
    }
  }

  function effectText(effect: UpgradeEffect): string {
    switch (effect.kind) {
      case 'rate':
        return t('upgrade.effect.rate', {
          buildings: effect.buildings.map((id) => t(`building.${id}`)).join(', '),
          factor: factor(effect.factor),
        })
      case 'price':
        return t('upgrade.effect.price', { product: t(`resource.${effect.product}`), euros: euros(effect.add) })
      case 'awareness':
        return t('upgrade.effect.awareness', { species: t(`animal.${effect.species}`), factor: factor(effect.factor) })
      case 'space':
        return t('upgrade.effect.space', { shelter: t(`shelter.${effect.shelter}`), space: amount(effect.add) })
      default:
        return t(`upgrade.effect.${effect.kind}`, { factor: factor(effect.factor) })
    }
  }

  // A bought upgrade leaves the offers at once, so the owned section is what pops.
  let pops = $state(0)

  function buy(id: UpgradeId) {
    let bought = false
    act((state) => (bought = buyUpgrade(state, id)))
    if (bought) pops++
  }
</script>

<section class="panel">
  <h2>{t('upgrades.title')}</h2>
  <ul class="offers">
    {#each offers as offer (offer.id)}
      <li class="card">
        <span class="art">
          <ArtSlot kind="effect" id={offer.effect.kind} size="lg" />
          {#if target(offer.effect)}
            {@const item = target(offer.effect)!}
            <span class="target"><ArtSlot kind={item.kind} id={item.id} size="md" /></span>
          {/if}
        </span>
        <div class="about">
          <h3>{t(`upgrade.${offer.id}.name`)}</h3>
          <span class="effect">{effectText(offer.effect)}</span>
          <span class="line">{t(`upgrade.${offer.id}.line`)}</span>
        </div>
        <button
          type="button"
          class="game-button primary"
          aria-label={t('upgrades.buy', { name: t(`upgrade.${offer.id}.name`), price: euros(offer.price) })}
          disabled={!offer.affordable}
          onclick={() => buy(offer.id)}
        >
          {t('building.buy', { price: euros(offer.price) })}
        </button>
      </li>
    {/each}
  </ul>
  {#if owned.length > 0}
    <details use:pop={pops}>
      <summary>{t('upgrades.owned', { count: owned.length })}</summary>
      <ul class="owned">
        {#each owned as upgrade (upgrade.id)}
          <li>
            <strong>{t(`upgrade.${upgrade.id}.name`)}</strong>
            <span class="effect">{effectText(upgrade.effect)}</span>
          </li>
        {/each}
      </ul>
    </details>
  {/if}
</section>

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .offers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }

  .offers li {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 6px 10px;
    padding: 10px;
  }

  .offers button {
    grid-column: 1 / -1;
  }

  .art {
    position: relative;
    width: 48px;
    height: 48px;
  }

  .target {
    position: absolute;
    right: -10px;
    bottom: -10px;
    padding: 1px;
    border-radius: 50%;
    background: var(--paper);
  }

  h3 {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 0.95rem;
    font-weight: 800;
  }

  .about {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
  }

  .line {
    font-style: italic;
    color: var(--ink-muted);
  }

  details {
    font-size: 0.9rem;
  }

  summary {
    cursor: pointer;
    color: var(--ink-muted);
  }

  .owned {
    margin-top: 6px;
    gap: 4px;
  }

  .owned li {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .owned .effect {
    color: var(--ink-muted);
  }
</style>
