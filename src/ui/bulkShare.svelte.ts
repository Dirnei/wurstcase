import { BULK_SHARES } from '../game/content/buyers'

// The share of the stock every bulk sell button sells. UI only: it survives tab switches, not a
// reload, and is not part of the save.
let chosen = $state<number>(BULK_SHARES[BULK_SHARES.length - 1])

export const bulkShare = {
  get value(): number {
    return chosen
  },
  set value(share: number) {
    chosen = share
  },
}
