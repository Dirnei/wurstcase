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

  const marketText = $derived(
    offer.market
      ? t('bulk.market', { percent: Math.floor(offer.market.level * 100) }) +
          (offer.market.recover > 0
            ? `, ${t('bulk.recover', { percent: percent(recovered), time: clock(offer.market.recover) })}`
            : '')
      : '',
  )
</script>

<div class="offer" class:best={offer.paysMore}>
  <p class="price">
    <span>{t('bulk.perUnit', { price: unitEuros(offer.perUnit) })}</span>
    <!-- Reserved, so a mark moving between buyers never re-wraps the line. -->
    <span class="mark" aria-hidden="true">{offer.paysMore ? '▲' : ''}</span>
    {#if offer.paysMore}<span class="visually-hidden">{t('bulk.paysMore')}</span>{/if}
  </p>
  {#if offer.market}
    <!-- Fixed tracks, so the recovering market only changes digits and the meter's fill. -->
    <small class="market" title={marketText}>
      <span class="visually-hidden">{marketText}</span>
      <span class="level" aria-hidden="true">{Math.floor(offer.market.level * 100)} %</span>
      <span class="meter" aria-hidden="true"><span style:width="{offer.market.level * 100}%"></span></span>
      <span class="recover" aria-hidden="true">{offer.market.recover > 0 ? clock(offer.market.recover) : ''}</span>
    </small>
  {/if}
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
    <!-- Units and price on lines of their own, so a growing value never re-wraps; a dash keeps the size. -->
    <span class="units">{offer.sellable ? `${liveCount(offer.units)} →` : '–'}</span>
    <span class="value">{offer.sellable ? liveEuros(offer.value) : ''}</span>
    {#if feeds}
      <!-- Reserved whether or not the sale costs anything. -->
      <span class="cost">
        {#if offer.sellable && (offer.cost.awareness > 0 || offer.cost.scandalLoss > 0)}
          <span class="pair">−{amount(offer.cost.awareness)}<ArtSlot kind="stat" id="awareness" size="sm" /></span>
          <!-- How many percent less customers would order and campaigns would win after this sale. -->
          <span class="pair" title={t('bulk.scandalLoss', { percent: offer.cost.scandalLoss })}
            >−{offer.cost.scandalLoss} %<ArtSlot kind="misc" id="megaMeatMark" size="sm" /></span
          >
        {/if}
      </span>
    {/if}
  </button>
</div>

<style>
  .offer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    padding: 5px;
    border: 1.4px solid transparent;
    border-radius: var(--radius-sm);
    font-variant-numeric: tabular-nums;
  }

  /* The buyer that pays more per unit: a tint and a solid border, plus the ▲ mark, never colour alone. */
  .best {
    border-color: var(--leaf);
    background: color-mix(in srgb, var(--leaf) 10%, transparent);
  }

  .price {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    margin: 0;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .mark {
    width: 1.2em;
    color: var(--leaf-text);
    text-align: right;
  }

  .market {
    display: grid;
    grid-template-columns: 5.5ch minmax(8px, 1fr) 5ch;
    white-space: nowrap;
    align-items: center;
    gap: 4px;
    color: var(--text-muted);
    font-size: 0.75rem;
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

  .sell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 44px;
    margin-top: auto;
    padding: 4px;
    line-height: 1.25;
  }

  .units,
  .value {
    min-height: 1.25em;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* Pairs of amount and icon wrap as a whole; phones reserve a second line, so the button never grows. */
  .cost {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    gap: 0 4px;
    min-height: 18px;
    color: var(--danger);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .pair {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    white-space: nowrap;
  }

  .pair :global(.slot) {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 767px) {
    .cost {
      min-height: 36px;
    }
  }
</style>
