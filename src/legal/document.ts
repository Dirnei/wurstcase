import type { OperatorDetails } from './operator'

/** Paragraph text may contain {placeholders} naming OperatorDetails fields. */
export interface LegalSection {
  id: string
  heading: string
  paragraphs: readonly string[]
}

export interface LegalDocument {
  title: string
  /** Shown above the sections, e.g. that a translation is not binding. */
  note?: string
  sections: readonly LegalSection[]
}

export interface LegalTexts {
  impressum: LegalDocument
  datenschutz: LegalDocument
}

export type Placeholder = keyof OperatorDetails
