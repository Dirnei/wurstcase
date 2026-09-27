<script lang="ts">
  import type { Float } from './motion/floats'

  // Decorative: the money in the top bar already shows the new amount.
  let { floats }: { floats: readonly Float[] } = $props()
</script>

<span class="floats" aria-hidden="true">
  {#each floats as float (float.id)}
    <span class="float">{float.text}</span>
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
