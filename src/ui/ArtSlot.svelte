<script lang="ts" module>
  export type ArtSize = 'sm' | 'md' | 'lg'
</script>

<script lang="ts">
  import type { Component } from 'svelte'
  import { ART, type ArtKind } from './art'

  // The one place illustrations are rendered; decorative, since the item's name is always shown too.
  let { kind, id, size = 'md' }: { kind: ArtKind; id: string; size?: ArtSize } = $props()

  const Art = $derived((ART[kind] as Readonly<Record<string, Component>>)[id])
</script>

<span class="slot {size}" data-size={size} aria-hidden="true">
  {#if Art}<Art />{/if}
</span>

<style>
  .slot {
    flex: none;
    display: inline-block;
  }

  .lg {
    width: 48px;
    height: 48px;
  }

  .md {
    width: 32px;
    height: 32px;
  }

  .sm {
    width: 20px;
    height: 20px;
  }
</style>
