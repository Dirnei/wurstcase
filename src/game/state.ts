import Decimal from 'break_eternity.js'
import { BUILDING_IDS, type BuildingId } from './content/buildings'
import { AKTION_IDS, type AktionId } from './content/aktionen'
import type { SpeciesId } from './content/animals'
import { BUYER_IDS, type BuyerId } from './content/buyers'
import type { MegaMeatEventId } from './content/megaMeatEvents'
import { RESOURCES, type ProductId, type ResourceId } from './content/resources'
import { SHELTER_IDS, type ShelterId } from './content/shelters'
import type { UpgradeId } from './content/upgrades'
import type { Bucket } from './systems/rollingWindow'
import { STARTING_CUSTOMERS } from './content/town'

/** An animal rescued into the Lebenshof. `name` is its index in the species' name pool, so saves stay language-independent. */
export interface Resident {
  species: SpeciesId
  name: number
}

/** MegaMeat's counter-events: the active one, and when and which comes next. */
export interface MegaMeatState {
  active: { event: MegaMeatEventId; remaining: number } | null
  /** Seconds until the next event starts; null while none is scheduled. */
  nextIn: number | null
  /** Position of the next event in MEGAMEAT_EVENTS. */
  nextIndex: number
  /** Events started so far in this game. */
  started: number
}

/** The whole game in one plain, serializable object. Game systems mutate it through tick(). */
export interface GameState {
  /** Total seconds of game time played in this game, restored from the save across reloads. */
  playTime: number
  money: Decimal
  /** Euros earned in this game; only grows, and unlocks buildings. */
  totalEarned: Decimal
  stock: Record<ResourceId, Decimal>
  buildings: Record<BuildingId, number>
  /** Units each building type has worked towards but not finished; at most 1 while waiting. */
  progress: Record<BuildingId, number>
  /** Buildings that ran short of input in the last tick, and the input they lack. Not saved. */
  waiting: Partial<Record<BuildingId, ResourceId>>
  /** Buildings whose next run did not fit the storeroom in the last tick, and their output. Not saved. */
  blocked: Partial<Record<BuildingId, ResourceId>>
  /** Storeroom level, 1 in a new game; the room per good grows with it. */
  storeroom: number
  /** Whole number of customers; a Decimal because awareness grows it towards town sizes and beyond. */
  customers: Decimal
  /** Whole number of orders waiting to be filled. */
  openOrders: Decimal
  /** Fraction towards the next order. */
  orderProgress: number
  /** Whether the shop assistant has been hired to sell automatically. */
  assistant: boolean
  /** MegaMeat's flood per resource, in units; missing means a fresh market. Falls over time. */
  megaMeatFlood: Partial<Record<ResourceId, Decimal>>
  /** Whole units sold to each bulk buyer in this game; later changes react to these. */
  unitsSold: Record<BuyerId, Decimal>
  /** Rescued animals in rescue order. Nothing ever removes one. */
  residents: Resident[]
  /** How many of each shelter type the Lebenshof has. */
  shelters: Record<ShelterId, number>
  /** Awareness pool in whole points, spent on Aktionen. */
  awareness: Decimal
  /** Fraction towards the next awareness point. */
  awarenessProgress: number
  aktionen: {
    /** Seconds of cooldown left; 0 = ready. */
    cooldown: Record<AktionId, number>
    /** Times each Aktion was run in this game. */
    runs: Record<AktionId, number>
    /** Whether the pool has held enough awareness once to unlock the Aktionen tab; never goes back. */
    unlocked: boolean
  }
  megaMeat: MegaMeatState
  /** Euros per second customers pay, smoothed over a few minutes; what feeding MegaMeat is measured against. */
  customerIncome: Decimal
  /** Upgrades owned in this game, in the order they were bought. */
  upgrades: UpgradeId[]
  /** Net stock change from passing time, newest bucket last; each bucket covers up to 1 s. Not saved. */
  trend: Bucket<ResourceId>[]
  /** Units sold to customers, newest bucket last; each bucket covers up to 1 s. Not saved. */
  sales: Bucket<ProductId>[]
  /** Seconds left to show a resource as short, held after the last wait so it does not flicker. Not saved. */
  shortage: Partial<Record<ResourceId, number>>
  /** Seconds left to show a resource as full, held after it was last full so it does not flicker. Not saved. */
  full: Partial<Record<ResourceId, number>>
}

export function createInitialState(): GameState {
  return {
    playTime: 0,
    money: new Decimal(0),
    totalEarned: new Decimal(0),
    stock: Object.fromEntries(RESOURCES.map((id) => [id, new Decimal(0)])) as Record<ResourceId, Decimal>,
    buildings: Object.fromEntries(BUILDING_IDS.map((id) => [id, 0])) as Record<BuildingId, number>,
    progress: Object.fromEntries(BUILDING_IDS.map((id) => [id, 0])) as Record<BuildingId, number>,
    customers: new Decimal(STARTING_CUSTOMERS),
    openOrders: new Decimal(0),
    orderProgress: 0,
    assistant: false,
    megaMeatFlood: {},
    unitsSold: Object.fromEntries(BUYER_IDS.map((id) => [id, new Decimal(0)])) as Record<BuyerId, Decimal>,
    residents: [],
    shelters: Object.fromEntries(SHELTER_IDS.map((id) => [id, 0])) as Record<ShelterId, number>,
    awareness: new Decimal(0),
    awarenessProgress: 0,
    aktionen: {
      cooldown: Object.fromEntries(AKTION_IDS.map((id) => [id, 0])) as Record<AktionId, number>,
      runs: Object.fromEntries(AKTION_IDS.map((id) => [id, 0])) as Record<AktionId, number>,
      unlocked: false,
    },
    megaMeat: { active: null, nextIn: null, nextIndex: 0, started: 0 },
    customerIncome: new Decimal(0),
    upgrades: [],
    waiting: {},
    blocked: {},
    storeroom: 1,
    shortage: {},
    full: {},
    trend: [],
    sales: [],
  }
}
