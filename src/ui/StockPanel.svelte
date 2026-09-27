<script lang="ts">
  import { RESOURCE_KINDS } from '../game/content/resources'
  import { isResourceShown } from '../game/systems/buildings'
  import { stockTrend, type Trend } from '../game/systems/trend'
  import { amount } from './amounts'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const groups = $derived(
    readGame((state) =>
      RESOURCE_KINDS.map(({ kind, resources }) => ({
        kind,
        items: resources
          .filter((resource) => isResourceShown(state, resource))
          .map((resource) => ({
            resource,
            stock: state.stock[resource],
            short: state.shortage[resource] !== undefined,
            trend: stockTrend(state, resource),
          })),
      })).filter((group) => group.items.length > 0),
    ),
  )

  const MARKS: Record<Trend, string> = { rising: '▲', falling: '▼', steady: '▬' }
</script>

<section class="panel">
  <h2>{t('stock.title')}</h2>
  <div class="groups">
    {#each groups as group (group.kind)}
      <div>
        <h3>{t(`stock.${group.kind}`)}</h3>
        <dl>
          {#each group.items as item (item.resource)}
            <dt class:short={item.short}>{t(`resource.${item.resource}`)}</dt>
            <dd class:short={item.short} title={item.short ? t('stock.short') : undefined}>
              {amount(item.stock)}
              {#if item.short}<span class="visually-hidden">({t('stock.short')})</span>{/if}
            </dd>
            <dd class="trend {item.trend}" title={t(`stock.trend.${item.trend}`)}>
              <span aria-hidden="true">{MARKS[item.trend]}</span>
              <span class="visually-hidden">{t(`stock.trend.${item.trend}`)}</span>
            </dd>
          {/each}
        </dl>
      </div>
    {/each}
  </div>
</section>

<style>
  .groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  h3 {
    margin: 0 0 4px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  dl {
    display: grid;
    grid-template-columns: 1fr auto 1.25em;
    gap: 2px 12px;
    margin: 0;
  }

  dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .trend {
    text-align: center;
    font-size: 0.75rem;
    line-height: 1.5rem;
  }

  .rising {
    color: var(--accent);
  }

  .falling {
    color: var(--danger);
  }

  .steady {
    color: var(--text-muted);
  }

  .short {
    color: var(--danger);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
