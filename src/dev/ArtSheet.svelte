<script lang="ts">
  // Every illustration at every size the game uses, on day paper and on dusk parchment, for reviewing the art.
  import type { Component } from 'svelte'
  import { ART, type ArtKind } from '../ui/art'
  import Landscape from '../ui/art/Landscape.svelte'

  const SIZES = [20, 32, 48, 96] as const
  const DATA_SIZE: Record<(typeof SIZES)[number], string> = { 20: 'sm', 32: 'md', 48: 'lg', 96: 'lg' }

  const groups = (Object.keys(ART) as ArtKind[]).map((kind) => ({
    kind,
    items: Object.entries(ART[kind] as Readonly<Record<string, Component>>),
  }))
</script>

<section class="panel">
  <h2>Art sheet</h2>
  <p class="muted">Each illustration at 20, 32, 48 and 96 px, in day colours (left) and dusk colours (right).</p>
  {#each groups as group (group.kind)}
    <h3>{group.kind}</h3>
    <div class="grid">
      {#each group.items as [id, Art] (id)}
        <figure>
          <div class="pair">
            {#each ['art-day', 'art-dusk'] as scheme (scheme)}
              <div class="swatch {scheme}">
                {#each SIZES as size (size)}
                  <span class="box" style:width="{size}px" style:height="{size}px" data-size={DATA_SIZE[size]}><Art /></span>
                {/each}
              </div>
            {/each}
          </div>
          <figcaption>{id}</figcaption>
        </figure>
      {/each}
    </div>
  {/each}

  <h3>landscape</h3>
  <div class="scenes">
    {#each ['art-day', 'art-dusk'] as scheme (scheme)}
      <div class="scene {scheme}"><Landscape contained /></div>
    {/each}
  </div>
</section>

<style>
  h3 {
    margin: 12px 0 4px;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .muted {
    margin: 0;
    color: var(--ink-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 10px;
  }

  figure {
    margin: 0;
  }

  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
  }

  .swatch {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px;
  }

  .art-day {
    background: #fbf5e6;
  }

  .art-dusk {
    background: #2e2820;
  }

  .box {
    display: inline-block;
  }

  figcaption {
    font-family: ui-monospace, monospace;
    font-size: 0.8rem;
  }

  .scenes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .scene {
    position: relative;
    height: 220px;
    border-radius: 8px;
    overflow: hidden;
  }
</style>
