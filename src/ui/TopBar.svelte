<script lang="ts">
  import logoUrl from '../assets/logo.svg'
  import { isLebenshofUnlocked } from '../game/systems/rescue'
  import { incomePerMinute } from '../game/systems/salesStats'
  import { LANGS } from '../i18n/lang'
  import { liveAmount, liveEuros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import { readGame } from './game.svelte'
  import { currentLang, setLanguage, t } from './i18n.svelte'
  import { flash } from './motion/pop'
  import { saleCount } from './motion/saleFlash.svelte'
  import { currentTab } from './route.svelte'

  const money = $derived(liveEuros(readGame((state) => state.money)))
  const income = $derived(liveEuros(readGame(incomePerMinute)))
  const awareness = $derived(
    readGame(isLebenshofUnlocked) ? liveAmount(readGame((state) => state.awareness)) : null,
  )
  const settingsOpen = $derived(currentTab() === 'einstellungen')
</script>

<header class="topbar">
  <div class="brand">
    <!-- Decorative: the title text right next to it names the game. -->
    <img src={logoUrl} alt="" width="36" height="36" />
    <h1>{t('app.title')}</h1>
  </div>

  <!-- Three fixed slots: a changing value only changes digits inside its own slot. -->
  <dl class="stats">
    <div class="stat money">
      <dt><ArtSlot kind="stat" id="money" size="sm" /><span title={t('money.label')}>{t('money.label')}</span></dt>
      <!-- With reduced motion the sale amount does not float; the money flashes instead (see app.css). -->
      <dd use:flash={saleCount()}>{money}</dd>
    </div>
    <div class="stat income">
      <dt><ArtSlot kind="stat" id="income" size="sm" /><span title={t('topbar.income')}>{t('topbar.income')}</span></dt>
      <dd>{t('topbar.incomeValue', { amount: income })}</dd>
    </div>
    <!-- Column 3 keeps its width while empty, so money and income do not move when awareness appears. -->
    {#if awareness !== null}
      <div class="stat awareness">
        <dt>
          <ArtSlot kind="stat" id="awareness" size="sm" /><span title={t('topbar.awareness')}>{t('topbar.awareness')}</span>
        </dt>
        <dd>{awareness}</dd>
      </div>
    {/if}
  </dl>

  <div class="tools">
    <div class="language" role="group" aria-label={t('language.toggle.label')}>
      {#each LANGS as lang (lang)}
        <button type="button" aria-pressed={currentLang() === lang} onclick={() => setLanguage(lang)}>
          {t(`language.toggle.${lang}`)}
        </button>
      {/each}
    </div>
    <a
      class="settings"
      href="#einstellungen"
      aria-label={t('tab.einstellungen')}
      aria-current={settingsOpen ? 'page' : undefined}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.2 5-.1-2.9 2-1.6-2-3.4-2.4.9-2.4-1.4L14.9 2h-4l-.4 2.6L8.1 6 5.7 5.1l-2 3.4 2 1.6v2.9l-2 1.6 2 3.4 2.4-.9 2.4 1.4.4 2.6h4l.4-2.6 2.4-1.4 2.4.9 2-3.4-2-1.6Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </a>
  </div>
</header>

<style>
  .topbar {
    display: flex;
    align-items: center;
    gap: 8px 20px;
    padding: 6px 12px;
    border: var(--outline) solid var(--ink);
    border-radius: var(--radius);
    background: var(--paper);
    box-shadow: 0 2px 0 var(--shadow);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand img {
    display: block;
    border-radius: 8px;
  }

  h1 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .stats {
    flex: 1;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 11rem));
    gap: 4px 16px;
    margin: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.15;
  }

  .money {
    grid-column: 1;
  }

  .income {
    grid-column: 2;
  }

  .awareness {
    grid-column: 3;
  }

  dt {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    color: var(--ink-muted);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  dt span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .money dd {
    font-size: 1.25rem;
  }

  .tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .language {
    display: flex;
    border: 1.4px solid var(--ink);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .language button {
    min-width: 36px;
    min-height: 32px;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: var(--ink-muted);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .language button[aria-pressed='true'] {
    background: var(--leaf);
    color: var(--on-leaf);
  }

  .settings {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1.4px solid var(--ink);
    border-radius: var(--radius-sm);
    background: var(--paper-2);
    color: var(--ink);
  }

  .settings[aria-current='page'] {
    background: var(--leaf);
    color: var(--on-leaf);
  }

  @media (max-width: 767px) {
    .topbar {
      flex-wrap: wrap;
    }

    h1 {
      font-size: 1.1rem;
    }

    .brand img {
      width: 28px;
      height: 28px;
    }

    .stats {
      order: 3;
      flex-basis: 100%;
      gap: 4px 8px;
    }

    dd {
      font-size: 0.95rem;
    }

    .money dd {
      font-size: 1.1rem;
    }

    .tools {
      margin-left: auto;
    }

    .language button,
    .settings {
      min-height: 44px;
      min-width: 44px;
    }

    .settings {
      height: 44px;
      width: 44px;
    }
  }

  /* The narrowest phones: slots are about 85px, so the longest German values need a smaller font. */
  @media (max-width: 359px) {
    dd {
      font-size: 0.85rem;
    }

    .money dd {
      font-size: 1rem;
    }
  }
</style>
