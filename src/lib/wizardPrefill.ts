import { resolveCategory } from '@/lib/constants'
import type { Category } from '@/types'

/** Concrete example shown as step-1 placeholder and empty-state helper. */
export const PROJECT_DESCRIPTION_EXAMPLE =
  'T.ex. Ny företagssajt, ca 10 sidor, bokning och koppling till vårt CRM.'

/** Query values and legacy aliases resolve to the same stored category as path slugs. */
export const resolveWizardCategory = (
  pathSlug?: string | null,
  queryKategori?: string | null,
): Category | '' => resolveCategory(queryKategori) || resolveCategory(pathSlug)

export const descriptionHelpMessage = (length: number): string => {
  if (length >= 40) return 'Bra! Detaljerade uppdrag får fler relevanta offerter.'
  if (length >= 10) return 'Toppen – nu har byråer ett bra underlag.'
  if (length === 0) return PROJECT_DESCRIPTION_EXAMPLE
  return `${length} / minst 10 tecken rekommenderas för bra matchning`
}
