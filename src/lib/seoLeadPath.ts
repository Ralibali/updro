import { CATEGORIES } from './constants'
import { SEO_AGENCY_CATEGORIES } from './seoAgencyData'

/** Keep a service's display name separate from the wizard's accepted categories. */
export function seoLeadPath(category?: string): string {
  if (!category) return '/publicera'
  const normalized = category.toLocaleLowerCase('sv-SE')
  const direct = CATEGORIES.find(value => value.toLocaleLowerCase('sv-SE') === normalized)
  const service = SEO_AGENCY_CATEGORIES.find(value => value.slug === normalized || value.name.toLocaleLowerCase('sv-SE') === normalized)
  const mapped = direct || service?.dbCategory
  if (!mapped || !CATEGORIES.some(value => value === mapped)) return '/publicera'
  return `/publicera?kategori=${encodeURIComponent(mapped)}`
}
