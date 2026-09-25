<script lang="ts">
  import Header from './ui/Header.svelte'
  import PlayTime from './ui/PlayTime.svelte'
</script>

<main>
  <Header />
  <PlayTime />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
  }
</style>
