import { CATEGORIES, resolveCategory } from './constants'
import { SEO_AGENCY_CATEGORIES } from './seoAgencyData'

/** Maps a service's display name or slug to a category the wizard accepts. */
export function resolveSeoLeadCategory(category?: string): string | undefined {
  if (!category) return undefined
  const normalized = category.toLocaleLowerCase('sv-SE')
  const direct = resolveCategory(category)
  const service = SEO_AGENCY_CATEGORIES.find(value => value.slug === normalized || value.name.toLocaleLowerCase('sv-SE') === normalized)
  const mapped = direct || service?.dbCategory
  return mapped && CATEGORIES.some(value => value === mapped) ? mapped : undefined
}

/** Keep a service's display name separate from the wizard's accepted categories. */
export function seoLeadPath(category?: string): string {
  const mapped = resolveSeoLeadCategory(category)
  return mapped ? `/publicera?kategori=${encodeURIComponent(mapped)}` : '/publicera'
}
