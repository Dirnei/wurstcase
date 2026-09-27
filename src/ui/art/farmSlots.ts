/** Most animals the farm scene draws; the rest show as "+N". */
export const MAX_FIGURES = 30

const ROWS = [
  { y: 84, jitter: 5 }, // front
  { y: 66, jitter: 4 }, // middle
  { y: 50, jitter: 3 }, // back
] as const
const COLUMNS = 10

// A fixed wobble per place, so the herd looks natural but never moves between reloads.
const WOBBLE = [0.3, -0.7, 0.9, -0.2, 0.6, -0.9, 0.1, 0.8, -0.5, 0.4]

// Columns in the order they fill, so the first animals spread over the meadow instead of queueing.
const COLUMN_ORDER = [4, 1, 7, 2, 9, 5, 0, 8, 3, 6]

/**
 * Places in the scene as percentages of its width and height (the animal's feet). The resident with
 * rescue index i always stands at place i: the front row fills first, then the middle, then the back.
 */
export const FARM_SLOTS: readonly { x: number; y: number }[] = Array.from({ length: MAX_FIGURES }, (_, i) => {
  const rowIndex = Math.floor(i / COLUMNS)
  const row = ROWS[rowIndex]
  const column = COLUMN_ORDER[(i + rowIndex * 3) % COLUMNS]
  const wobble = WOBBLE[(i * 7) % WOBBLE.length]
  return {
    x: 30 + column * (64 / (COLUMNS - 1)) + wobble * 2,
    y: row.y + wobble * row.jitter,
  }
})

export interface FarmFigures {
  /** Rescue index of each drawn resident; its place is FARM_SLOTS[index]. */
  figures: { index: number }[]
  /** Drawn residents from back to front, as rescue indices. */
  drawOrder: number[]
  /** Residents beyond the cap. */
  more: number
}

export function farmFigures(residents: number): FarmFigures {
  const shown = Math.min(residents, MAX_FIGURES)
  const figures = Array.from({ length: shown }, (_, index) => ({ index }))
  const drawOrder = figures.map((figure) => figure.index).sort((a, b) => FARM_SLOTS[a].y - FARM_SLOTS[b].y)
  return { figures, drawOrder, more: Math.max(0, residents - MAX_FIGURES) }
}
