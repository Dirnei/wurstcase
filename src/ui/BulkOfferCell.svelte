<script lang="ts">
  import type Decimal from 'break_eternity.js'
  import type { BuyerId } from '../game/content/buyers'
  import type { ResourceId } from '../game/content/resources'
  import { amount, euros, liveCount, liveEuros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import { currentLang, t } from './i18n.svelte'

  export type Offer = {
    perUnit: number
    paysMore: boolean
    sellable: boolean
    units: Decimal
    value: Decimal
    cost: { awareness: number; scandalLoss: number }
    market: { level: number; recover: number } | null
  }

  let {
    buyer,
    resource,
    share,
    feeds,
    offer,
    recovered,
    onsell,
  }: {
    buyer: BuyerId
    resource: ResourceId
    share: number
    feeds: boolean
    offer: Offer
    recovered: number
    onsell: () => void
  } = $props()

  const percent = (value: number) => Math.round(value * 100)

  /** Game seconds as m:ss. */
  function clock(seconds: number): string {
    const whole = Math.ceil(seconds)
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
  }

  /** A price per unit with two fixed decimals (lots are cheap per unit), rounded down like every figure. */
  function unitEuros(value: number): string {
    if (value >= 1000) {
      return liveEuros(value)
    }
    const cents = Math.floor(value * 100 + 1e-9) / 100
    return t('money.amount', {
      amount: cents.toLocaleString(currentLang(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    })
  }

  // A market at 100 % shows nothing in its slot; the slot keeps its width.
  const level = $derived(offer.market ? Math.floor(offer.market.level * 100) : 100)

  const marketText = $derived(
    offer.market && level < 100
      ? t('bulk.market', { percent: level }) +
          (offer.market.recover > 0
            ? `, ${t('bulk.recover', { percent: percent(recovered), time: clock(offer.market.recover) })}`
            : '')
      : '',
  )

  const showCost = $derived(offer.sellable && (offer.cost.awareness > 0 || offer.cost.scandalLoss > 0))
</script>

{#snippet cost()}
  {#if showCost}
    <span class="pair">−{amount(offer.cost.awareness)}<ArtSlot kind="stat" id="awareness" size="sm" /></span>
    <!-- How many percent less customers would order and campaigns would win after this sale. -->
    <span class="pair" title={t('bulk.scandalLoss', { percent: offer.cost.scandalLoss })}
      >−{offer.cost.scandalLoss} %<ArtSlot kind="misc" id="megaMeatMark" size="sm" /></span
    >
  {/if}
{/snippet}

<!--
  Fixed tracks: price · flood slot · button · cost (MegaMeat only). Wide screens put them on one
  line; narrower ones put price and flood slot above the button. Nothing but digits changes when
  values tick, a market floods or recovers, or a sale becomes available.
-->
<div class="offer" class:best={offer.paysMore} class:feeds>
  <p class="price">
    <span class="unit">{unitEuros(offer.perUnit)}</span><span class="per">{t('bulk.perUnit', { price: '' })}</span>
    <!-- Reserved, so a mark moving between buyers never re-wraps the line. -->
    <span class="mark" aria-hidden="true">{offer.paysMore ? '▲' : ''}</span>
    {#if offer.paysMore}<span class="visually-hidden">{t('bulk.paysMore')}</span>{/if}
  </p>
  <small class="market" title={marketText || undefined}>
    {#if offer.market && level < 100}
      <span class="visually-hidden">{marketText}</span>
      <span class="level" aria-hidden="true">{level} %</span>
      <span class="meter" aria-hidden="true"><span style:width="{offer.market.level * 100}%"></span></span>
      <span class="recover" aria-hidden="true">{offer.market.recover > 0 ? clock(offer.market.recover) : ''}</span>
    {/if}
  </small>
  <button
    type="button"
    class="game-button sell"
    disabled={!offer.sellable}
    aria-label={offer.sellable
      ? t('bulk.sellShare', {
          percent: percent(share),
          resource: t(`resource.${resource}`),
          buyer: t(`bulk.${buyer}.name`),
          units: amount(offer.units),
          price: euros(offer.value),
        }) + (feeds ? `, ${t('bulk.cost', { awareness: offer.cost.awareness, percent: offer.cost.scandalLoss })}` : '')
      : t('bulk.sellShareNone', { percent: percent(share), resource: t(`resource.${resource}`) })}
    onclick={onsell}
  >
    <!-- A dash keeps the size while the share is less than a lot. -->
    <span class="units">{offer.sellable ? `${liveCount(offer.units)} →` : '–'}</span>
    <span class="value">{offer.sellable ? liveEuros(offer.value) : ''}</span>
    {#if feeds}
      <!-- Phones: the cost is the button's last line, reserved whether or not the sale costs anything. -->
      <span class="cost inside" aria-hidden="true">{@render cost()}</span>
    {/if}
  </button>
  {#if feeds}
    <!-- Wider screens: the cost beside the button; the button's label already says it. -->
    <span class="cost beside" aria-hidden="true">{@render cost()}</span>
  {/if}
</div>

<style>
  /* Track widths in ch of this font, sized for the longest figures (German thousands, 4-digit costs). */
  .offer {
    --price-w: calc(7.5ch + 1.1em);
    --flood-w: calc(9ch + 24px);
    --cost-w: calc(9.5ch + 30px);
    display: grid;
    grid-template-columns: var(--price-w) var(--flood-w) minmax(0, 1fr);
    align-items: center;
    column-gap: 6px;
    min-width: 0;
    padding: 2px 4px;
    border: 1.4px solid transparent;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }

  .offer.feeds {
    grid-template-columns: var(--price-w) var(--flood-w) minmax(0, 1fr) var(--cost-w);
  }

  .price {
    grid-column: 1;
  }

  .market {
    grid-column: 2;
  }

  .sell {
    grid-column: 3;
  }

  .beside {
    grid-column: 4;
  }

  /* The buyer that pays more per unit: a tint and a solid border, plus the ▲ mark, never colour alone. */
  .best {
    border-color: var(--leaf);
    background: color-mix(in srgb, var(--leaf) 10%, transparent);
  }

  .price {
    display: flex;
    align-items: baseline;
    margin: 0;
    white-space: nowrap;
  }

  .mark {
    width: 1.1em;
    margin-left: auto;
    color: var(--leaf-text);
    text-align: right;
  }

  /* Wide screens: the header says "per unit" once per column, so the price stays short. */
  .per {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .market {
    display: grid;
    grid-template-columns: 4.5ch minmax(8px, 1fr) 4.5ch;
    align-items: center;
    gap: 3px;
    color: var(--text-muted);
    font-size: 0.72rem;
    white-space: nowrap;
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
    background: var(--danger);
  }

  .recover {
    text-align: right;
  }

  /* Units and price on one line; the track's width, not the digits, sets the button's size. */
  .sell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4ch;
    min-width: 0;
    min-height: 30px;
    padding: 2px 4px;
    font-size: 0.78rem;
    line-height: 1.2;
    white-space: nowrap;
  }

  .cost {
    display: flex;
    align-items: center;
    gap: 0 4px;
    color: var(--danger);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .inside {
    display: none;
  }

  .pair {
    display: inline-flex;
    align-items: center;
    gap: 1px;
  }

  .pair :global(.slot) {
    width: 13px;
    height: 13px;
  }

  /*
   * Below 1280 px the one-line tracks no longer fit beside the stock rail (German thousands need
   * about 880 px): price and flood slot go on a small line above the button, cost beside it.
   */
  @media (max-width: 1279px) {
    .offer {
      row-gap: 1px;
      padding: 1px 4px;
    }

    .price,
    .market {
      grid-row: 1;
      font-size: 0.7rem;
      line-height: 1.15;
    }

    .sell {
      grid-row: 2;
      grid-column: 1 / 4;
      min-height: 28px;
      padding: 1px 4px;
    }

    .beside {
      grid-row: 2;
    }
  }

  /* Below 1024 px the cells have room to say "per unit" themselves. */
  @media (max-width: 1023px) {
    .offer {
      --price-w: calc(12ch + 1.1em);
    }

    .per {
      position: static;
      width: auto;
      height: auto;
      overflow: visible;
      clip: auto;
    }
  }

  /* Phones: the button carries units, price and cost on lines of their own. */
  @media (max-width: 767px) {
    .offer,
    .offer.feeds {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .market {
      grid-template-columns: 4.5ch minmax(6px, 1fr) 4ch;
    }

    .sell {
      grid-column: 1 / -1;
      flex-direction: column;
      gap: 0;
      min-height: 44px;
      line-height: 1.1;
    }

    .per,
    .beside {
      display: none;
    }

    .inside {
      display: flex;
      justify-content: center;
      min-height: 1.1em;
    }

    .inside .pair :global(.slot) {
      width: 11px;
      height: 11px;
    }
  }
</style>
