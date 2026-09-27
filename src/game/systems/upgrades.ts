import type { SpeciesId } from '../content/animals'
import type { BuildingId } from '../content/buildings'
import { PRODUCT_PRICES } from '../content/products'
import { PRODUCTS, type ProductId } from '../content/resources'
import type { ShelterId } from '../content/shelters'
import { getUpgrade, UPGRADES, type UnlockClause, type UpgradeDef, type UpgradeEffect, type UpgradeId } from '../content/upgrades'
import type { GameState } from '../state'

// Only content and state are imported here, so every system can ask for its upgrade effects.

/** Effect lookups need only the owned list, so the balancing model can use them without a full state. */
type Owned = Readonly<Pick<GameState, 'upgrades'>>

function clauseHolds(state: Readonly<GameState>, clause: UnlockClause): boolean {
  if ('earned' in clause) {
    return state.totalEarned.gte(clause.earned)
  }
  if ('owned' in clause) {
    return state.buildings[clause.owned] >= clause.atLeast
  }
  if ('shelters' in clause) {
    return state.shelters[clause.shelters] >= clause.atLeast
  }
  if ('residents' in clause) {
    const count =
      clause.residents === 'any'
        ? state.residents.length
        : state.residents.filter((resident) => resident.species === clause.residents).length
    return count >= clause.atLeast
  }
  return state.aktionen.runs[clause.aktionRuns] >= clause.atLeast
}

export function isUpgradeOwned(state: Readonly<GameState>, id: UpgradeId): boolean {
  return state.upgrades.includes(id)
}

/** Conditions only ever become true within a game, so an offer stays until it is bought. */
export function isUpgradeOffered(state: Readonly<GameState>, id: UpgradeId): boolean {
  return !isUpgradeOwned(state, id) && getUpgrade(id).when.every((clause) => clauseHolds(state, clause))
}

/** Upgrades on offer, cheapest first. */
export function offeredUpgrades(state: Readonly<GameState>): UpgradeDef[] {
  return UPGRADES.filter((upgrade) => isUpgradeOffered(state, upgrade.id)).sort((a, b) => a.price - b.price)
}

/** The panel shows once anything was offered; offers never go away except by being bought. */
export function isUpgradesUnlocked(state: Readonly<GameState>): boolean {
  return state.upgrades.length > 0 || offeredUpgrades(state).length > 0
}

/** Earnings at which the first upgrade comes on offer, from upgrades that depend on earnings alone. */
export function firstUpgradeAt(): number {
  const thresholds = UPGRADES.flatMap((upgrade) => {
    const earned = upgrade.when.flatMap((clause) => ('earned' in clause ? [clause.earned] : []))
    return earned.length === upgrade.when.length ? [Math.max(...earned)] : []
  })
  return Math.min(...thresholds)
}

export function canBuyUpgrade(state: Readonly<GameState>, id: UpgradeId): boolean {
  return isUpgradeOffered(state, id) && state.money.gte(getUpgrade(id).price)
}

export function buyUpgrade(state: GameState, id: UpgradeId): boolean {
  if (!canBuyUpgrade(state, id)) {
    return false
  }
  state.money = state.money.sub(getUpgrade(id).price)
  state.upgrades.push(id)
  return true
}

/** Effects of the owned upgrades of one kind. */
function owned<K extends UpgradeEffect['kind']>(state: Owned, kind: K): Extract<UpgradeEffect, { kind: K }>[] {
  return state.upgrades
    .map((id) => getUpgrade(id).effect)
    .filter((effect): effect is Extract<UpgradeEffect, { kind: K }> => effect.kind === kind)
}

const product = (factors: readonly number[]) => factors.reduce((total, factor) => total * factor, 1)

export function rateFactor(state: Owned, building: BuildingId): number {
  return product(owned(state, 'rate').filter((e) => e.buildings.includes(building)).map((e) => e.factor))
}

/** Units per manual click; a whole number. */
export function manualFactor(state: Owned): number {
  return product(owned(state, 'manual').map((e) => e.factor))
}

export function priceBonus(state: Owned, productId: ProductId): number {
  return owned(state, 'price')
    .filter((e) => e.product === productId)
    .reduce((total, e) => total + e.add, 0)
}

/** A product's price in whole euros with price upgrades. */
export function productPrice(state: Owned, productId: ProductId): number {
  return PRODUCT_PRICES[productId] + priceBonus(state, productId)
}

/** Products in selling order, most expensive first by upgraded price. */
export function productsByPrice(state: Owned): ProductId[] {
  return [...PRODUCTS].sort((a, b) => productPrice(state, b) - productPrice(state, a))
}

export function ordersFactor(state: Owned): number {
  return product(owned(state, 'orders').map((e) => e.factor))
}

export function awarenessFactor(state: Owned, species: SpeciesId): number {
  return product(owned(state, 'awareness').filter((e) => e.species === species).map((e) => e.factor))
}

export function conversionFactor(state: Owned): number {
  return product(owned(state, 'conversion').map((e) => e.factor))
}

/** Whole space added to each shelter of the type. */
export function spaceBonus(state: Owned, shelter: ShelterId): number {
  return owned(state, 'space')
    .filter((e) => e.shelter === shelter)
    .reduce((total, e) => total + e.add, 0)
}

export function animalPriceFactor(state: Owned): number {
  return product(owned(state, 'animalPrice').map((e) => e.factor))
}

export function aktionCostFactor(state: Owned): number {
  return product(owned(state, 'aktionCost').map((e) => e.factor))
}
