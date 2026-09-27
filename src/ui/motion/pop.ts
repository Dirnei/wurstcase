/** Restarts a class-based CSS animation, even while it is still running. */
function restart(node: HTMLElement, className: string) {
  node.classList.remove(className)
  // Reading layout makes the browser drop the old animation before the class comes back.
  void node.offsetWidth
  node.classList.add(className)
}

/** Runs the animation of `className` each time `trigger` goes up, and on creation when it is already above 0. */
function onTrigger(className: string) {
  return (node: HTMLElement, trigger: number) => {
    let last = trigger
    if (trigger > 0) restart(node, className)
    return {
      update(next: number) {
        if (next === last) return
        last = next
        restart(node, className)
      },
    }
  }
}

/**
 * Pops whatever was just bought; also on creation, for an element the purchase itself created. The
 * animation only scales, so layout and clicks are untouched.
 */
export const pop = onTrigger('popping')

/** Highlights a value without moving it: the reduced-motion stand-in for the floating sale amount. */
export const flash = onTrigger('flashing')
