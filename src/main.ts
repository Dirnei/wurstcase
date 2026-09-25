import { mount } from 'svelte'
import App from './App.svelte'
import './app.css'
import { startLoop } from './loop/loop'
import { advance } from './ui/game.svelte'

mount(App, { target: document.getElementById('app')! })

startLoop({
  clock: () => performance.now(),
  schedule: (fn, intervalMs) => {
    const id = setInterval(fn, intervalMs)
    return () => clearInterval(id)
  },
  onTick: advance,
})
