export const RAW = ['soybeans', 'wheat', 'oats'] as const
export const INTERMEDIATES = ['tofu', 'seitan', 'oatDrink'] as const
export const PRODUCTS = ['tofuWurst', 'leverkas', 'haferCappuccino'] as const

/** Every resource by kind: raw ingredients, intermediates, products. */
export const RESOURCES = [...RAW, ...INTERMEDIATES, ...PRODUCTS] as const

export type ProductId = (typeof PRODUCTS)[number]
export type ResourceId = (typeof RESOURCES)[number]
