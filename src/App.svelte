<script lang="ts">
  import type { Component } from 'svelte'
  import { devToolsEnabled } from './dev/enabled'
  import { CHAINS } from './game/content/buildings'
  import { isLebenshofUnlocked } from './game/systems/rescue'
  import BulkBuyersPanel from './ui/BulkBuyersPanel.svelte'
  import ChainPanel from './ui/ChainPanel.svelte'
  import Footer from './ui/Footer.svelte'
  import Header from './ui/Header.svelte'
  import LebenshofPanel from './ui/LebenshofPanel.svelte'
  import LegalPage from './ui/LegalPage.svelte'
  import ManualActions from './ui/ManualActions.svelte'
  import Money from './ui/Money.svelte'
  import Notices from './ui/Notices.svelte'
  import PlayTime from './ui/PlayTime.svelte'
  import SalesPanel from './ui/SalesPanel.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import StockPanel from './ui/StockPanel.svelte'
  import { readGame } from './ui/game.svelte'
  import { currentRoute } from './ui/route.svelte'

  const route = $derived(currentRoute())
  const lebenshof = $derived(readGame(isLebenshofUnlocked))
  // Asked only when #dev is opened; the page and its chart library load only if it is on.
  const devPage = $derived(route === 'dev' ? loadDevPage() : null)

  async function loadDevPage(): Promise<Component | null> {
    return (await devToolsEnabled()) ? (await import('./dev/DevPage.svelte')).default : null
  }
</script>

<main>
  <Header />
  <Notices />
  {#if route === 'game'}
    {@render game()}
  {:else if route === 'dev'}
    {#await devPage}
      {@render game()}
    {:then DevPage}
      {#if DevPage}
        <DevPage />
      {:else}
        {@render game()}
      {/if}
    {/await}
  {:else}
    <LegalPage page={route} />
  {/if}
  <Footer />
</main>

{#snippet game()}
  <div class="status">
    <Money />
    <PlayTime />
  </div>
  <SalesPanel />
  <ManualActions />
  {#each CHAINS as chain (chain)}
    <ChainPanel {chain} />
  {/each}
  {#if lebenshof}
    <LebenshofPanel />
  {/if}
  <StockPanel />
  <BulkBuyersPanel />
  <SavePanel />
{/snippet}

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100vh;
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
  }

  .status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
</style>
