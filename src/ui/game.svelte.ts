import { encodeSave, exportSave } from '../game/save'
import { createInitialState, type GameState } from '../game/state'
import { tick } from '../game/tick'
import { createSaveSlots, type LoadResult } from '../save/slots'

export type SaveNotice = 'restored-backup' | 'unreadable' | 'too-new' | 'cannot-save'

const slots = createSaveSlots(() => localStorage)
const loaded = slots.load()

// The state stays a plain object outside Svelte's reactivity; this counter tells the UI it changed.
const state: GameState = loaded.status === 'loaded' ? loaded.state : createInitialState()
let version = $state(0)
let notices = $state<SaveNotice[]>(noticesFor(loaded))

export function advance(seconds: number): void {
  tick(state, seconds)
  version++
}

/** Reads a game value reactively: components using it re-render after every tick. */
export function readGame<T>(select: (state: Readonly<GameState>) => T): T {
  void version
  return select(state)
}

export function saveNow(): void {
  const written = slots.write(encodeSave(state, Date.now()))
  if (!written && !slots.storageAvailable) {
    addNotice('cannot-save')
  }
}

export function exportCurrentSave(): string {
  return exportSave(encodeSave(state, Date.now()))
}

/** Continues from an imported state and saves it right away. */
export function replaceState(next: GameState): void {
  Object.assign(state, next)
  version++
  saveNow()
}

export function currentNotices(): readonly SaveNotice[] {
  return notices
}

export function dismissNotice(notice: SaveNotice): void {
  notices = notices.filter((n) => n !== notice)
}

function addNotice(notice: SaveNotice): void {
  if (!notices.includes(notice)) {
    notices = [...notices, notice]
  }
}

function noticesFor(result: LoadResult): SaveNotice[] {
  switch (result.status) {
    case 'loaded':
      return result.restoredFromBackup ? ['restored-backup'] : []
    case 'unreadable':
      return ['unreadable']
    case 'too-new':
      return ['too-new']
    case 'storage-unavailable':
      return ['cannot-save']
    case 'empty':
      return []
  }
}
