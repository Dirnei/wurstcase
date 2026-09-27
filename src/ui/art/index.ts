import type { Component } from 'svelte'
import type { AktionId } from '../../game/content/aktionen'
import type { SpeciesId } from '../../game/content/animals'
import type { BuildingId } from '../../game/content/buildings'
import type { BuyerId } from '../../game/content/buyers'
import type { ResourceId } from '../../game/content/resources'
import type { ShelterId } from '../../game/content/shelters'
import type { UpgradeEffect } from '../../game/content/upgrades'
import type { TabId } from '../tabs'
import FactCheck from './aktionen/FactCheck.svelte'
import Flyer from './aktionen/Flyer.svelte'
import OpenFarmDay from './aktionen/OpenFarmDay.svelte'
import ViralReel from './aktionen/ViralReel.svelte'
import Chicken from './animals/Chicken.svelte'
import Cow from './animals/Cow.svelte'
import Pig from './animals/Pig.svelte'
import CafeBar from './buildings/CafeBar.svelte'
import LeverkasOven from './buildings/LeverkasOven.svelte'
import OatField from './buildings/OatField.svelte'
import OatMill from './buildings/OatMill.svelte'
import SeitanKitchen from './buildings/SeitanKitchen.svelte'
import SoybeanField from './buildings/SoybeanField.svelte'
import TofuPress from './buildings/TofuPress.svelte'
import TofuWurstKitchen from './buildings/TofuWurstKitchen.svelte'
import WheatField from './buildings/WheatField.svelte'
import BiogasPlant from './buyers/BiogasPlant.svelte'
import MegaMeatSack from './buyers/MegaMeatSack.svelte'
import Basket from './effects/Basket.svelte'
import CheaperAktionen from './effects/CheaperAktionen.svelte'
import CheaperAnimals from './effects/CheaperAnimals.svelte'
import Converts from './effects/Converts.svelte'
import FasterProduction from './effects/FasterProduction.svelte'
import Gear from './effects/Gear.svelte'
import HandWork from './effects/HandWork.svelte'
import Megaphone from './effects/Megaphone.svelte'
import MoreSpace from './effects/MoreSpace.svelte'
import PriceTag from './effects/PriceTag.svelte'
import MegaMeatMark from './misc/MegaMeatMark.svelte'
import Newspaper from './misc/Newspaper.svelte'
import HaferCappuccino from './resources/HaferCappuccino.svelte'
import Leverkas from './resources/Leverkas.svelte'
import OatDrink from './resources/OatDrink.svelte'
import Oats from './resources/Oats.svelte'
import Seitan from './resources/Seitan.svelte'
import Soybeans from './resources/Soybeans.svelte'
import Tofu from './resources/Tofu.svelte'
import TofuWurst from './resources/TofuWurst.svelte'
import Wheat from './resources/Wheat.svelte'
import Pasture from './shelters/Pasture.svelte'
import Stable from './shelters/Stable.svelte'
import Coins from './stats/Coins.svelte'
import Hourglass from './stats/Hourglass.svelte'
import Income from './stats/Income.svelte'
import OrderSlip from './stats/OrderSlip.svelte'
import Person from './stats/Person.svelte'
import BarnHeart from './tabs/BarnHeart.svelte'
import MarketStall from './tabs/MarketStall.svelte'
import Sprout from './tabs/Sprout.svelte'
import UpgradeStar from './tabs/UpgradeStar.svelte'

// Every map is a full Record over its ids, so content without art fails the type check.

export const BUILDING_ART: Record<BuildingId, Component> = {
  soybeanField: SoybeanField,
  tofuPress: TofuPress,
  tofuWurstKitchen: TofuWurstKitchen,
  wheatField: WheatField,
  seitanKitchen: SeitanKitchen,
  leverkasOven: LeverkasOven,
  oatField: OatField,
  oatMill: OatMill,
  cafeBar: CafeBar,
}

export const RESOURCE_ART: Record<ResourceId, Component> = {
  soybeans: Soybeans,
  wheat: Wheat,
  oats: Oats,
  tofu: Tofu,
  seitan: Seitan,
  oatDrink: OatDrink,
  tofuWurst: TofuWurst,
  leverkas: Leverkas,
  haferCappuccino: HaferCappuccino,
}

export const SPECIES_ART: Record<SpeciesId, Component> = { chicken: Chicken, pig: Pig, cow: Cow }

export const SHELTER_ART: Record<ShelterId, Component> = { stable: Stable, pasture: Pasture }

export const AKTION_ART: Record<AktionId, Component> = {
  flyer: Flyer,
  openFarmDay: OpenFarmDay,
  viralReel: ViralReel,
  factCheck: FactCheck,
}

export const BUYER_ART: Record<BuyerId, Component> = { megaMeat: MegaMeatSack, biogas: BiogasPlant }

export const EFFECT_ART: Record<UpgradeEffect['kind'], Component> = {
  rate: FasterProduction,
  manual: HandWork,
  price: PriceTag,
  orders: Basket,
  awareness: Megaphone,
  conversion: Converts,
  space: MoreSpace,
  animalPrice: CheaperAnimals,
  aktionCost: CheaperAktionen,
}

export const TAB_ART: Record<TabId, Component> = {
  produktion: Sprout,
  verkauf: MarketStall,
  upgrades: UpgradeStar,
  lebenshof: BarnHeart,
  aktionen: Megaphone,
  einstellungen: Gear,
}

export type StatId = 'money' | 'income' | 'awareness' | 'playTime' | 'customers' | 'orders'

export const STAT_ART: Record<StatId, Component> = {
  money: Coins,
  income: Income,
  awareness: Megaphone,
  playTime: Hourglass,
  customers: Person,
  orders: OrderSlip,
}

export type MiscId = 'newspaper' | 'megaMeatMark'

export const MISC_ART: Record<MiscId, Component> = { newspaper: Newspaper, megaMeatMark: MegaMeatMark }

export const ART = {
  building: BUILDING_ART,
  resource: RESOURCE_ART,
  species: SPECIES_ART,
  shelter: SHELTER_ART,
  aktion: AKTION_ART,
  buyer: BUYER_ART,
  effect: EFFECT_ART,
  tab: TAB_ART,
  stat: STAT_ART,
  misc: MISC_ART,
} as const

export type ArtKind = keyof typeof ART
