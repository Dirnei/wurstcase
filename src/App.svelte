<script lang="ts">
  import Footer from './ui/Footer.svelte'
  import Header from './ui/Header.svelte'
  import LegalPage from './ui/LegalPage.svelte'
  import Notices from './ui/Notices.svelte'
  import PlayTime from './ui/PlayTime.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import { currentRoute } from './ui/route.svelte'

  const route = $derived(currentRoute())
</script>

<main>
  <Header />
  <Notices />
  {#if route === 'game'}
    <PlayTime />
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
</style>
