<script lang="ts">
  import type { Component } from 'svelte'
  import { fade } from 'svelte/transition'
  import { devToolsEnabled } from './dev/enabled'
  import AktionenPanel from './ui/AktionenPanel.svelte'
  import Landscape from './ui/art/Landscape.svelte'
  import Alerts from './ui/Alerts.svelte'
  import Footer from './ui/Footer.svelte'
  import LebenshofPanel from './ui/LebenshofPanel.svelte'
  import LegalPage from './ui/LegalPage.svelte'
  import NewsTicker from './ui/NewsTicker.svelte'
  import ProductionTab from './ui/ProductionTab.svelte'
  import ResourceRail from './ui/ResourceRail.svelte'
  import SalesTab from './ui/SalesTab.svelte'
  import SettingsTab from './ui/SettingsTab.svelte'
  import TabNav from './ui/TabNav.svelte'
  import TopBar from './ui/TopBar.svelte'
  import UpgradesPanel from './ui/UpgradesPanel.svelte'
  import { prefersReducedMotion } from './ui/motion/reducedMotion.svelte'
  import { currentRoute, currentTab, syncTabAddress } from './ui/route.svelte'

  const route = $derived(currentRoute())
  const tab = $derived(currentTab())
  // The new tab fades in; the old one leaves at once, so the two never show together.
  const fadeIn = $derived({ duration: prefersReducedMotion() ? 0 : 200 })
  // Asked only when #dev is opened; the page and its chart library load only if it is on.
  const devPage = $derived(route === 'dev' ? loadDevPage() : null)

  async function loadDevPage(): Promise<Component | null> {
    return (await devToolsEnabled()) ? (await import('./dev/DevPage.svelte')).default : null
  }

  $effect(() => {
    if (route === 'game') {
      syncTabAddress()
    }
  })
</script>

{#if route === 'game'}
  {@render game()}
{:else if route === 'dev'}
  {#await devPage}
    {@render game()}
  {:then DevPage}
    {#if DevPage}
      <div class="page">
        <TopBar />
        <DevPage />
        <Footer />
      </div>
    {:else}
      {@render game()}
    {/if}
  {/await}
{:else}
  <div class="page">
    <TopBar />
    <main><LegalPage page={route} /></main>
    <Footer />
  </div>
{/if}

{#snippet game()}
  <Landscape />
  <div class="shell">
    <TopBar />
    <NewsTicker />
    <Alerts />
    <div class="workspace">
      <div class="tabs">
        <TabNav />
        <main class="tab-content" id="main">
          {#key tab}
            <div class="tab-body" in:fade={fadeIn}>
              {#if tab === 'produktion'}
                <ProductionTab />
              {:else if tab === 'verkauf'}
                <SalesTab />
              {:else if tab === 'upgrades'}
                <UpgradesPanel />
              {:else if tab === 'lebenshof'}
                <LebenshofPanel />
              {:else if tab === 'aktionen'}
                <AktionenPanel />
              {:else}
                <SettingsTab />
              {/if}
            </div>
          {/key}
        </main>
      </div>
      <ResourceRail />
    </div>
    <Footer />
  </div>
{/snippet}

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100dvh;
    max-width: 960px;
    margin: 0 auto;
    padding: 12px 16px;
  }

  .page :global(footer) {
    margin-top: auto;
  }

  /* Desktop: the whole game fits the viewport; only the tab's content scrolls. */
  .shell {
    display: grid;
    grid-template-rows: auto auto auto minmax(0, 1fr) auto;
    gap: 8px;
    height: 100dvh;
    max-width: 1280px;
    margin: 0 auto;
    padding: 12px 16px 8px;
  }

  .shell > :global(.alerts:empty) {
    display: none;
  }

  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 14px;
    min-height: 0;
  }

  .tabs {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /*
   * position: relative makes the scrolling area the containing block of absolutely positioned
   * content inside it (such as .visually-hidden text), so that content scrolls and clips with
   * the tab instead of stretching the page below the viewport.
   */
  .tab-content {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    /* Only content that opts in (scroll-snap-align) snaps, and only when a scroll ends near it. */
    scroll-snap-type: y proximity;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px 10px;
    border: var(--outline) solid var(--ink);
    border-radius: 0 var(--radius) var(--radius) var(--radius);
    background: var(--paper);
    box-shadow: 0 2px 0 var(--shadow);
  }

  .tab-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Panels inside a tab are sections of its sheet, not sheets of their own. */
  .tab-content :global(.panel) {
    padding: 0;
    border: none;
    box-shadow: none;
    background: none;
  }

  .tab-content :global(.panel + .panel) {
    padding-top: 12px;
    border-top: 1.4px dashed var(--line);
    border-radius: 0;
  }

  @media (max-width: 1023px) {
    .workspace {
      grid-template-columns: minmax(0, 1fr) 130px;
      gap: 10px;
    }
  }

  /* Short windows and phones: the page scrolls normally instead. */
  @media (max-height: 599px), (max-width: 767px) {
    .shell {
      height: auto;
      min-height: 100dvh;
      grid-template-rows: auto;
    }

    .tab-content {
      overflow: visible;
    }
  }

  @media (max-width: 767px) {
    .shell {
      gap: 8px;
      padding: 8px 8px calc(var(--tabbar-height) + 90px + env(safe-area-inset-bottom));
    }

    .workspace {
      display: block;
    }

    .tab-content {
      border-radius: var(--radius);
      padding: 10px;
    }
  }
</style>
