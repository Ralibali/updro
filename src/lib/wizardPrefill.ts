import { CATEGORIES, CATEGORY_BY_SLUG } from '@/lib/constants'
import type { Category } from '@/types'

/** Concrete example shown as step-1 placeholder and empty-state helper. */
export const PROJECT_DESCRIPTION_EXAMPLE =
  'T.ex. Ny företagssajt, ca 10 sidor, bokning och koppling till vårt CRM.'

const isCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value)

/**
 * Resolve the wizard category from URL.
 * `?kategori=` (exact CATEGORIES name) wins so existing query links keep working.
 * `/publicera/:kategori` falls back to CATEGORY_BY_SLUG (e.g. webbutveckling → Webbutveckling).
 */
export const resolveWizardCategory = (
  pathSlug?: string | null,
  queryKategori?: string | null,
): Category | '' => {
  const fromQuery = queryKategori?.trim() || ''
  if (fromQuery && isCategory(fromQuery)) return fromQuery

  const slug = pathSlug?.trim().toLowerCase() || ''
  if (!slug) return ''

  const fromSlug = CATEGORY_BY_SLUG[slug]
  return fromSlug && isCategory(fromSlug) ? fromSlug : ''
}

export const descriptionHelpMessage = (length: number): string => {
  if (length >= 40) return 'Bra! Detaljerade uppdrag får fler relevanta offerter.'
  if (length >= 10) return 'Toppen – nu har byråer ett bra underlag.'
  if (length === 0) return PROJECT_DESCRIPTION_EXAMPLE
  return `${length} / minst 10 tecken rekommenderas för bra matchning`
}
