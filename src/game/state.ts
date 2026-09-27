import Decimal from 'break_eternity.js'
import { BUILDING_IDS, type BuildingId } from './content/buildings'
import type { SpeciesId } from './content/animals'
import { BUYER_IDS, type BuyerId } from './content/buyers'
import { RESOURCES, type ResourceId } from './content/resources'
import { SHELTER_IDS, type ShelterId } from './content/shelters'
import { STARTING_CUSTOMERS } from './content/town'

/** An animal rescued into the Lebenshof. `name` is its index in the species' name pool, so saves stay language-independent. */
export interface Resident {
  species: SpeciesId
  name: number
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
  /** Whole number of customers; a Decimal because awareness grows it towards town sizes and beyond. */
  customers: Decimal
  /** Whole number of orders waiting to be filled. */
  openOrders: Decimal
  /** Fraction towards the next order. */
  orderProgress: number
  /** Whether the shop assistant has been hired to sell automatically. */
  assistant: boolean
  /** Whole units sold to each bulk buyer in this game; later changes react to these. */
  unitsSold: Record<BuyerId, Decimal>
  /** Rescued animals in rescue order. Nothing ever removes one. */
  residents: Resident[]
  /** How many of each shelter type the Lebenshof has. */
  shelters: Record<ShelterId, number>
  /** Fraction towards the next customer converted by awareness. */
  conversionProgress: number
  /** Seconds left to show a resource as short, held after the last wait so it does not flicker. Not saved. */
  shortage: Partial<Record<ResourceId, number>>
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
    unitsSold: Object.fromEntries(BUYER_IDS.map((id) => [id, new Decimal(0)])) as Record<BuyerId, Decimal>,
    residents: [],
    shelters: Object.fromEntries(SHELTER_IDS.map((id) => [id, 0])) as Record<ShelterId, number>,
    conversionProgress: 0,
    waiting: {},
    shortage: {},
  }
}
