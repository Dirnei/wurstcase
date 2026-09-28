<script lang="ts">
  import type { ArtKind } from './art'
  import ArtSlot from './ArtSlot.svelte'
  import type { Float } from './motion/floats'

  // Decorative: the money in the top bar, or the stock on the card, already shows the new amount.
  let { floats, art }: { floats: readonly Float[]; art?: { kind: ArtKind; id: string } } = $props()
</script>

<span class="floats" aria-hidden="true">
  {#each floats as float (float.id)}
    <span class="float">{float.text}{#if art}<ArtSlot kind={art.kind} id={art.id} size="sm" />{/if}</span>
  {/each}
</span>

<style>
  .floats {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }

  .float {
    position: absolute;
    left: 50%;
    top: 0;
    padding: 0 6px;
    border-radius: 6px;
    background: var(--paper);
    color: var(--leaf-text);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
    opacity: 0;
    animation: float-up var(--motion-float) var(--ease-out);
  }

  /* Readable for most of the rise, then gone. */
  @keyframes float-up {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    65% {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: translate(-50%, -28px);
    }
  }
</style>
