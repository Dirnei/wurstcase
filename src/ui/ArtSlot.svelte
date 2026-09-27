<script lang="ts" module>
  export type ArtKind = 'building' | 'resource' | 'species' | 'shelter' | 'aktion' | 'buyer' | 'effect' | 'tab' | 'stat'
  export type ArtSize = 'sm' | 'md' | 'lg'
</script>

<script lang="ts">
  import { BUILDINGS, type ChainId } from '../game/content/buildings'

  // Placeholder art until ui-art: a paper tile with a monogram, tinted by chain or kind.
  let { kind, id, size = 'md' }: { kind: ArtKind; id: string; size?: ArtSize } = $props()

  const CHAIN_TINT: Record<ChainId, string> = { soy: '#b9cf8e', wheat: '#e6cd86', oat: '#dccaa2' }
  const KIND_TINT: Record<ArtKind, string> = {
    building: '#d9c7a1',
    resource: '#d9c7a1',
    species: '#e8c3b0',
    shelter: '#cfa98a',
    aktion: '#c9b6d6',
    buyer: '#b7c4c9',
    effect: '#c9b6d6',
    tab: '#d9c7a1',
    stat: '#e6cd86',
  }

  const chain = $derived(
    kind === 'building' || kind === 'resource'
      ? BUILDINGS.find((building) => building.id === id || building.output === id)?.chain
      : undefined,
  )
  const tint = $derived(chain ? CHAIN_TINT[chain] : KIND_TINT[kind])
  // "soybeanField" → "SF", "tofu" → "T".
  const monogram = $derived((id[0] + (id.slice(1).match(/[A-Z]/)?.[0] ?? '')).toUpperCase())
</script>

<span class="slot {size}" style:--tint={tint} data-size={size} aria-hidden="true">{monogram}</span>

<style>
  .slot {
    flex: none;
    display: inline-grid;
    place-items: center;
    border: 1.4px solid var(--ink);
    border-radius: 8px;
    background: var(--tint);
    color: #4a3a28;
    font-family: var(--font-heading);
    font-weight: 700;
    line-height: 1;
  }

  .lg {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .md {
    width: 32px;
    height: 32px;
    font-size: 13px;
    border-radius: 7px;
  }

  .sm {
    width: 20px;
    height: 20px;
    font-size: 9px;
    border-radius: 5px;
    border-width: 1px;
  }
</style>
