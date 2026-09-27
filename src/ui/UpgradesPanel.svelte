<script lang="ts">
  import { getUpgrade, type UpgradeEffect, type UpgradeId } from '../game/content/upgrades'
  import { buyUpgrade, canBuyUpgrade, offeredUpgrades } from '../game/systems/upgrades'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import { currentLang, t } from './i18n.svelte'

  const offers = $derived(
    readGame((state) =>
      offeredUpgrades(state).map((upgrade) => ({ ...upgrade, affordable: canBuyUpgrade(state, upgrade.id) })),
    ),
  )
  const owned = $derived(readGame((state) => state.upgrades.map((id) => getUpgrade(id))))

  // Factors such as ×0.75 need two decimals, which the game's amount format would cut off.
  const factor = (value: number) => new Intl.NumberFormat(currentLang(), { maximumFractionDigits: 2 }).format(value)

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

  function buy(id: UpgradeId) {
    act((state) => buyUpgrade(state, id))
  }
</script>

<section class="panel">
  <h2>{t('upgrades.title')}</h2>
  <ul>
    {#each offers as offer (offer.id)}
      <li>
        <button type="button" class="game-button" disabled={!offer.affordable} onclick={() => buy(offer.id)}>
          {t('upgrades.buy', { name: t(`upgrade.${offer.id}.name`), price: euros(offer.price) })}
        </button>
        <div class="about">
          <span class="effect">{effectText(offer.effect)}</span>
          <span class="line">{t(`upgrade.${offer.id}.line`)}</span>
        </div>
      </li>
    {/each}
  </ul>
  {#if owned.length > 0}
    <details>
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

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
  }

  .about {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
  }

  .line {
    font-style: italic;
    color: var(--text-muted);
  }

  button {
    font-variant-numeric: tabular-nums;
  }

  details {
    font-size: 0.9rem;
  }

  summary {
    cursor: pointer;
    color: var(--text-muted);
  }

  .owned {
    margin-top: 6px;
    gap: 4px;
  }

  .owned li {
    gap: 8px;
  }

  .owned .effect {
    color: var(--text-muted);
  }
</style>
