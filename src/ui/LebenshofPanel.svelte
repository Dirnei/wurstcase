<script lang="ts">
  import { SPECIES, type SpeciesId } from '../game/content/animals'
  import { SHELTERS, type ShelterId } from '../game/content/shelters'
  import { awarenessRate, isAwarenessReduced } from '../game/systems/awareness'
  import {
    animalPrice,
    buildShelter,
    canBuildShelter,
    canRescue,
    displayNames,
    isShelterUnlocked,
    isSpeciesOffered,
    rescue,
    shelterPrice,
    totalSpace,
    usedSpace,
  } from '../game/systems/rescue'
  import type { TranslationKey } from '../i18n/translate'
  import { amount, euros } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const used = $derived(readGame(usedSpace))
  const total = $derived(readGame(totalSpace))
  const awareness = $derived(readGame(awarenessRate))
  const reduced = $derived(readGame(isAwarenessReduced))

  const shelters = $derived(
    readGame((state) =>
      SHELTERS.filter((shelter) => isShelterUnlocked(state, shelter.id)).map((shelter) => ({
        ...shelter,
        count: state.shelters[shelter.id],
        price: shelterPrice(state, shelter.id),
        buildable: canBuildShelter(state, shelter.id),
      })),
    ),
  )

  const offers = $derived(
    readGame((state) =>
      SPECIES.filter((species) => isSpeciesOffered(state, species.id)).map((species) => ({
        ...species,
        price: animalPrice(state, species.id),
        check: canRescue(state, species.id),
      })),
    ),
  )

  const groups = $derived(
    readGame((state) => {
      // Names are looked up here so a language switch re-labels every resident.
      const named = displayNames(state.residents, (species, index) =>
        t(`animal.${species}.name.${index}` as TranslationKey),
      )
      return SPECIES.map((species) => ({
        ...species,
        labels: named.filter((n) => n.resident.species === species.id).map((n) => n.label),
      })).filter((group) => group.labels.length > 0)
    }),
  )

  function build(id: ShelterId) {
    act((state) => buildShelter(state, id))
  }

  function buy(id: SpeciesId) {
    act((state) => rescue(state, id))
  }
</script>

<section class="panel">
  <h2>{t('lebenshof.title')}</h2>
  <div class="numbers">
    <span>{t('lebenshof.space', { used: amount(used), total: amount(total) })}</span>
    <span class:reduced>
      {t('lebenshof.awareness', { amount: amount(awareness) })}
      {#if reduced}{t('lebenshof.reduced')}{/if}
    </span>
  </div>

  <h3>{t('lebenshof.shelters')}</h3>
  <ul class="offers">
    {#each shelters as shelter (shelter.id)}
      <li>
        <button type="button" class="game-button" disabled={!shelter.buildable} onclick={() => build(shelter.id)}>
          {t('lebenshof.build', { shelter: t(`shelter.${shelter.id}`), price: euros(shelter.price) })}
        </button>
        <small>{t('lebenshof.shelterInfo', { space: amount(shelter.space), count: amount(shelter.count) })}</small>
      </li>
    {/each}
  </ul>

  <h3>{t('lebenshof.animals')}</h3>
  <p class="line">{t('lebenshof.megaMeatLine')}</p>
  <ul class="offers">
    {#each offers as offer (offer.id)}
      <li>
        <button type="button" class="game-button" disabled={offer.check !== 'ok'} onclick={() => buy(offer.id)}>
          {offer.emoji}
          {t('lebenshof.rescue', { animal: t(`animal.${offer.id}`), price: euros(offer.price) })}
        </button>
        <small>
          {t('lebenshof.animalInfo', { space: amount(offer.space), awareness: amount(offer.awareness) })}
          {#if offer.check === 'money'}
            · {t('lebenshof.lackMoney')}
          {:else if offer.check === 'space'}
            · {t('lebenshof.lackSpace')}
          {/if}
        </small>
      </li>
    {/each}
  </ul>

  <h3>{t('lebenshof.residents')}</h3>
  {#if groups.length === 0}
    <p class="muted">{t('lebenshof.empty')}</p>
  {:else}
    <ul class="groups">
      {#each groups as group (group.id)}
        <li>
          <span class="count">{group.emoji} {amount(group.labels.length)}</span>
          <span class="names">{group.labels.join(', ')}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  p {
    margin: 0;
  }

  h3 {
    margin: 4px 0 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
    font-variant-numeric: tabular-nums;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .offers li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }

  .groups li {
    display: flex;
    gap: 12px;
  }

  .reduced {
    color: var(--danger);
  }

  .count {
    flex: none;
    min-width: 3.5em;
    font-variant-numeric: tabular-nums;
  }

  small,
  .muted {
    color: var(--text-muted);
  }

  .muted {
    font-size: 0.875rem;
  }

  .line {
    font-size: 0.875rem;
    font-style: italic;
    color: var(--text-muted);
  }

  button {
    font-variant-numeric: tabular-nums;
  }
</style>
