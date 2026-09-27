import type { ResourceId } from './resources'

export type ManualActionId = 'harvestSoybeans' | 'pressTofu' | 'makeTofuWurst'

export interface ResourceAmount {
  resource: ResourceId
  amount: number
}

export interface ManualActionDef {
  id: ManualActionId
  input?: ResourceAmount
  output: ResourceAmount
}

/** The soy chain by hand, so a new game can start without any building. */
export const MANUAL_ACTIONS: readonly ManualActionDef[] = [
  { id: 'harvestSoybeans', output: { resource: 'soybeans', amount: 1 } },
  {
    id: 'pressTofu',
    input: { resource: 'soybeans', amount: 3 },
    output: { resource: 'tofu', amount: 1 },
  },
  {
    id: 'makeTofuWurst',
    input: { resource: 'tofu', amount: 1 },
    output: { resource: 'tofuWurst', amount: 1 },
  },
]
