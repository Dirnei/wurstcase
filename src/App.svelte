<script lang="ts">
  import { CHAINS } from './game/content/buildings'
  import ChainPanel from './ui/ChainPanel.svelte'
  import Footer from './ui/Footer.svelte'
  import Header from './ui/Header.svelte'
  import LegalPage from './ui/LegalPage.svelte'
  import ManualActions from './ui/ManualActions.svelte'
  import Money from './ui/Money.svelte'
  import Notices from './ui/Notices.svelte'
  import PlayTime from './ui/PlayTime.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import StockPanel from './ui/StockPanel.svelte'
  import { currentRoute } from './ui/route.svelte'

  const route = $derived(currentRoute())
</script>

<main>
  <Header />
  <Notices />
  {#if route === 'game'}
    <div class="status">
      <Money />
      <PlayTime />
    </div>
    <ManualActions />
    {#each CHAINS as chain (chain)}
      <ChainPanel {chain} />
    {/each}
    <StockPanel />
    <SavePanel />
  {:else}
    <LegalPage page={route} />
  {/if}
  <Footer />
</main>

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
