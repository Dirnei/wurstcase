<script lang="ts">
  import logoUrl from '../assets/logo.svg'
  import { isLebenshofUnlocked } from '../game/systems/rescue'
  import { incomePerMinute } from '../game/systems/salesStats'
  import { liveAmount, liveEuros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { flash } from './motion/pop'
  import { saleCount } from './motion/saleFlash.svelte'

  const money = $derived(liveEuros(readGame((state) => state.money)))
  const income = $derived(liveEuros(readGame(incomePerMinute)))
  const awareness = $derived(
    readGame(isLebenshofUnlocked) ? liveAmount(readGame((state) => state.awareness)) : null,
  )
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

    /* Name on the first row, the three slots on their own: side by side they do not fit. */
    .stats {
      flex-basis: 100%;
      gap: 4px 8px;
    }

    dd {
      font-size: 0.95rem;
    }

    .money dd {
      font-size: 1.1rem;
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
