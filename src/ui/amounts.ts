import type Decimal from 'break_eternity.js'
import { formatNumber } from '../format/number'
import { currentLang, t } from './i18n.svelte'

/** An amount in the selected language's number format; reactive to language changes. */
export function amount(value: Decimal | number): string {
  return formatNumber(value, currentLang())
}

export function euros(value: Decimal | number): string {
  return t('money.amount', { amount: amount(value) })
}
