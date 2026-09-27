<script lang="ts">
  import CounterEventBanner from './CounterEventBanner.svelte'
  import Notices from './Notices.svelte'
</script>

<!-- Everything urgent, shown above the tabs so it is seen whichever tab is open. -->
<div class="alerts">
  <Notices />
  <CounterEventBanner />
</div>

<style>
  .alerts {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .alerts:empty {
    display: none;
  }
</style>
