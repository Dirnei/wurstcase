import Decimal from 'break_eternity.js'
import type { Lang } from '../i18n/lang'

const SUFFIXES: Record<Lang, readonly string[]> = {
  en: ['', 'K', 'M', 'B', 'T'],
  de: ['', ' Tsd.', ' Mio.', ' Mrd.', ' Bio.'],
}

const SCIENTIFIC_FROM_EXPONENT = 15

// A few float ULPs of headroom, so 2.3 * 10 = 22.999999999999996 truncates to 23, while
// 999.999999999999 still stays below 1000.
const RELATIVE_EPSILON = 4 * Number.EPSILON

export interface FormatOptions {
  /** Keeps trailing zeros, so a live figure's width depends only on its magnitude: 37.0, 1.20K. */
  fixed?: boolean
  /** With `fixed`: no decimals below 1,000, for counts of whole things such as stock: 37, 1.20K. */
  whole?: boolean
}

/** Formats an amount for display; always rounds toward zero so the player never sees more than they have. */
export function formatNumber(
  value: Decimal | number,
  lang: Lang,
  { fixed = false, whole = false }: FormatOptions = {},
): string {
  const decimal = new Decimal(value)
  const body = formatAbs(decimal.abs(), lang, fixed, whole)
  return decimal.sign < 0 && /[1-9]/.test(body) ? `-${body}` : body
}

function formatAbs(abs: Decimal, lang: Lang, fixed: boolean, whole: boolean): string {
  if (abs.lt(1000)) {
    return withSeparator(truncate(abs.toNumber(), whole ? 0 : 1, fixed), lang)
  }
  if (abs.layer >= 2) {
    return abs.toString()
  }

  const { mantissa, exponent } = normalize(abs)

  if (exponent >= SCIENTIFIC_FROM_EXPONENT) {
    return `${withSeparator(truncate(mantissa, 2, fixed), lang)}e${exponent}`
  }

  const group = Math.floor(exponent / 3)
  const digitsBeforePoint = exponent - group * 3 + 1
  const scaled = mantissa * 10 ** (digitsBeforePoint - 1)
  return withSeparator(truncate(scaled, 3 - digitsBeforePoint, fixed), lang) + SUFFIXES[lang][group]
}

// break_eternity can report e.g. 10^15 - 1 as mantissa 0.999… with exponent 15.
function normalize(abs: Decimal): { mantissa: number; exponent: number } {
  let mantissa = abs.mantissa
  let exponent = abs.exponent
  while (mantissa < 1) {
    mantissa *= 10
    exponent -= 1
  }
  while (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  return { mantissa, exponent }
}

function truncate(value: number, decimals: number, fixed: boolean): string {
  const factor = 10 ** decimals
  const truncated = Math.floor(value * factor * (1 + RELATIVE_EPSILON)) / factor
  const text = truncated.toFixed(decimals)
  if (fixed) {
    return text
  }
  return text.includes('.') ? text.replace(/0+$/, '').replace(/\.$/, '') : text
}

function withSeparator(text: string, lang: Lang): string {
  return lang === 'de' ? text.replace('.', ',') : text
}
