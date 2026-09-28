<script lang="ts">
  import { ALL_HEADLINE_KEYS, HEADLINE_SECONDS } from '../game/content/headlines'
  import { createTickerMemory, nextHeadline } from '../game/systems/ticker'
  import type { TranslationKey } from '../i18n/translate'
  import ArtSlot from './ArtSlot.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  // The ticker runs on real time, like the rest of the UI; its position is never saved.
  let memory = createTickerMemory()
  let key = $state(advance())
  // Bumped on every new headline so the fade-in replays.
  let shown = $state(0)
  let timer: ReturnType<typeof setInterval> | undefined

  const started = $derived(readGame((state) => state.megaMeat.started))
  const breaking = $derived(readGame((state) => state.megaMeat.active?.event ?? null))
  let seenStarted = readGame((state) => state.megaMeat.started)

  function advance(): string {
    const next = readGame((state) => nextHeadline(state, memory))
    memory = next.memory
    return next.key
  }

  function show(next: string): void {
    key = next
    shown++
  }

  function restart(): void {
    clearInterval(timer)
    timer = setInterval(() => show(advance()), HEADLINE_SECONDS * 1000)
  }

  $effect(() => {
    restart()
    return () => clearInterval(timer)
  })

  // A new counter-event breaks into the ticker at once and holds for a full rotation.
  $effect(() => {
    if (started > seenStarted && breaking) {
      show(`headline.event.${breaking}`)
      restart()
    }
    seenStarted = started
  })
</script>

<p class="ticker" aria-live="polite" aria-label={t('ticker.label')}>
  <ArtSlot kind="misc" id="newspaper" size="md" />
  <!--
    Every headline sits in the same grid cell, all but the current one invisible, so the ticker is
    always as tall as the longest headline at this width and never moves what is below it.
  -->
  <span class="stack">
    {#each ALL_HEADLINE_KEYS as other (other)}
      {#if other !== key}
        <span class="headline reserve" class:breaking={other.startsWith('headline.event.')} aria-hidden="true">
          {t(other as TranslationKey)}
        </span>
      {/if}
    {/each}
    {#key shown}
      <span class="headline" class:breaking={key.startsWith('headline.event.')}>{t(key as TranslationKey)}</span>
    {/key}
  </span>
</p>

<style>
  .ticker {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    padding: 6px 12px;
    min-height: 2.5em;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    font-size: 0.9rem;
  }

  .stack {
    display: grid;
    flex: 1;
    min-width: 0;
  }

  .headline {
    grid-area: 1 / 1;
    animation: fade-in 0.6s ease-out;
  }

  /* Takes up space, shows nothing and is left out of the accessibility tree. */
  .reserve {
    visibility: hidden;
    animation: none;
  }

  .breaking {
    color: var(--danger);
    font-weight: 600;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .headline {
      animation: none;
    }
  }
</style>
