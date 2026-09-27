export const RAW = ['soybeans', 'wheat', 'oats'] as const
export const INTERMEDIATES = ['tofu', 'seitan', 'oatDrink'] as const
export const PRODUCTS = ['tofuWurst', 'leverkas', 'haferCappuccino'] as const

/** Every resource in display order: raw ingredients, intermediates, products. */
export const RESOURCES = [...RAW, ...INTERMEDIATES, ...PRODUCTS] as const

export type ProductId = (typeof PRODUCTS)[number]
export type ResourceId = (typeof RESOURCES)[number]
export type ResourceKind = 'raw' | 'intermediate' | 'product'

export const RESOURCE_KINDS: readonly { kind: ResourceKind; resources: readonly ResourceId[] }[] = [
  { kind: 'raw', resources: RAW },
  { kind: 'intermediate', resources: INTERMEDIATES },
  { kind: 'product', resources: PRODUCTS },
]
