import { getBuilding, type BuildingId, type ChainId } from './buildings'
import type { ResourceId } from './resources'

export type ManualActionId =
  | 'harvestSoybeans'
  | 'pressTofu'
  | 'makeTofuWurst'
  | 'harvestWheat'
  | 'makeSeitan'
  | 'bakeLeverkas'
  | 'harvestOats'
  | 'makeOatDrink'
  | 'makeHaferCappuccino'

export interface ResourceAmount {
  resource: ResourceId
  amount: number
}

export interface ManualActionDef {
  id: ManualActionId
  /** The building that does the same step; the action unlocks with it. */
  building: BuildingId
  chain: ChainId
  input?: ResourceAmount
  output: ResourceAmount
}

/**
 * Every step of every chain by hand, so a chain can get going before its buildings are bought.
 * Each action does one unit of its building's work, at the building's input ratio.
 */
const STEPS: readonly { id: ManualActionId; building: BuildingId }[] = [
  { id: 'harvestSoybeans', building: 'soybeanField' },
  { id: 'pressTofu', building: 'tofuPress' },
  { id: 'makeTofuWurst', building: 'tofuWurstKitchen' },
  { id: 'harvestWheat', building: 'wheatField' },
  { id: 'makeSeitan', building: 'seitanKitchen' },
  { id: 'bakeLeverkas', building: 'leverkasOven' },
  { id: 'harvestOats', building: 'oatField' },
  { id: 'makeOatDrink', building: 'oatMill' },
  { id: 'makeHaferCappuccino', building: 'cafeBar' },
]

export const MANUAL_ACTIONS: readonly ManualActionDef[] = STEPS.map(({ id, building }) => {
  const def = getBuilding(building)
  return {
    id,
    building,
    chain: def.chain,
    input: def.input && { resource: def.input.resource, amount: def.input.ratio },
    output: { resource: def.output, amount: 1 },
  }
})
