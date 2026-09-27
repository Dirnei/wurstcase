// Svelte transitions do not see CSS media queries, so the preference is mirrored here and kept live.
const query = matchMedia('(prefers-reduced-motion: reduce)')
let reduced = $state(query.matches)
query.addEventListener('change', (event) => (reduced = event.matches))

export function prefersReducedMotion(): boolean {
  return reduced
}
