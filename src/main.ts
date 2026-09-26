import { mount } from 'svelte'
import App from './App.svelte'
import './app.css'
import { startLoop } from './loop/loop'
import { startAutosave } from './save/autosave'
import { advance, saveNow } from './ui/game.svelte'

function every(fn: () => void, intervalMs: number): () => void {
  const id = setInterval(fn, intervalMs)
  return () => clearInterval(id)
}

mount(App, { target: document.getElementById('app')! })

startLoop({
  clock: () => performance.now(),
  schedule: every,
  onTick: advance,
})

startAutosave({
  save: saveNow,
  schedule: every,
  onPageHide: (save) => {
    // pagehide also fires on mobile and for back/forward-cached pages, unlike beforeunload.
    const onVisibilityChange = () => document.visibilityState === 'hidden' && save()
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', save)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', save)
    }
  },
})
