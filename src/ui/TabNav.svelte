<script lang="ts">
  import { euros } from './amounts'
  import ArtSlot from './ArtSlot.svelte'
  import { hasBadge, markSeen } from './badges.svelte'
  import { readGame } from './game.svelte'
  import { t } from './i18n.svelte'
  import { currentTab } from './route.svelte'
  import { isTabUnlocked, TABS, tabUnlockAt } from './tabs'

  const open = $derived(currentTab())
  const tabs = $derived(
    readGame((state) =>
      TABS.map((id) => {
        const unlocked = isTabUnlocked(state, id)
        const at = tabUnlockAt(id)
        return {
          id,
          unlocked,
          hint: !unlocked && at !== null ? t('locked.at', { amount: euros(at) }) : null,
          badge: unlocked && hasBadge(id, open),
        }
      }),
    ),
  )

  // What the open tab offers counts as seen, now and after every tick while it stays open.
  $effect(() => {
    readGame(() => 0)
    markSeen(open)
  })
</script>

<nav class="tabnav" aria-label={t('tab.nav')}>
  <ul>
    {#each tabs as tab (tab.id)}
      <li class:settings={tab.id === 'einstellungen'}>
        {#if tab.unlocked}
          <a href="#{tab.id}" class="tab" aria-current={open === tab.id ? 'page' : undefined}>
            <ArtSlot kind="tab" id={tab.id} size="sm" />
            <span class="label">{t(`tab.${tab.id}`)}</span>
            {#if tab.badge}
              <span class="dot" aria-hidden="true"></span>
              <span class="visually-hidden">({t('tab.new')})</span>
            {/if}
          </a>
        {:else}
          <span class="tab locked">
            <ArtSlot kind="tab" id={tab.id} size="sm" />
            <span class="stack">
              <span class="label">
                {t(`tab.${tab.id}`)}
                <span class="visually-hidden">({t('tab.lockedLabel')})</span>
              </span>
              <small>{tab.hint}</small>
            </span>
          </span>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  ul {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    margin: 0;
    padding: 0 0 0 8px;
    list-style: none;
  }

  .tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: var(--outline) solid var(--ink);
    border-bottom: none;
    border-radius: 10px 10px 0 0;
    background: var(--paper-2);
    color: var(--ink);
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    white-space: nowrap;
  }

  @media (max-width: 1023px) {
    .settings {
      display: none;
    }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .tab {
      padding-inline: 8px;
      font-size: 0.8rem;
    }

    .tab > :global(.slot) {
      display: none;
    }
  }

  a.tab:hover {
    background: var(--paper);
  }

  .tab[aria-current='page'] {
    z-index: 1;
    padding-bottom: 9px;
    margin-bottom: calc(-1 * var(--outline));
    background: var(--paper);
  }

  .locked {
    color: var(--ink-muted);
    border-style: dashed;
    opacity: 0.85;
    padding-block: 2px;
  }

  .stack {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .locked small {
    font-size: 0.7rem;
    font-weight: 600;
  }

  .dot {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--ink);
    border-radius: 50%;
    background: #d9812f;
  }

  @media (max-width: 767px) {
    .tabnav {
      position: fixed;
      z-index: 20;
      inset: auto 0 0 0;
      height: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
      padding: 4px 4px calc(4px + env(safe-area-inset-bottom));
      border-top: var(--outline) solid var(--ink);
      background: var(--paper);
    }

    ul {
      padding: 0;
      gap: 2px;
      align-items: stretch;
    }

    li {
      flex: 1;
      min-width: 0;
    }

    .settings {
      display: none;
    }

    .stack {
      align-items: center;
    }

    .tab {
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      height: 100%;
      min-height: 52px;
      padding: 4px 2px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      font-size: 0.75rem;
      white-space: normal;
      text-align: center;
    }

    .tab[aria-current='page'] {
      padding-bottom: 4px;
      margin-bottom: 0;
      background: var(--paper-2);
    }

    .label {
      hyphens: auto;
    }

    .locked > :global(.slot) {
      display: none;
    }

    .locked small {
      font-size: 0.68rem;
      line-height: 1.1;
    }

    .dot {
      top: 2px;
      right: calc(50% - 16px);
    }
  }
</style>
