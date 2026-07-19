/**
 * Marknadstal per kategori (från edge-funktionen category-stats) och logik
 * för när de är trovärdiga nog att visa på kategorisidorna.
 */

export interface CategoryStats {
  category: string
  projects: number
  offers: number
  avg_offers_per_project: number
  median_hours_to_first_offer: number | null
}

/** Tröskel: visa inte statistik för kategorier med för få datapunkter. */
export const CATEGORY_STATS_MIN_PROJECTS = 5

export const isValidCategoryStats = (raw: unknown): raw is { categories: CategoryStats[] } => {
  if (!raw || typeof raw !== 'object') return false
  const list = (raw as { categories?: unknown }).categories
  return (
    Array.isArray(list) &&
    list.every(
      item =>
        item &&
        typeof item.category === 'string' &&
        typeof item.projects === 'number' &&
        typeof item.offers === 'number',
    )
  )
}

export const findCategoryStats = (
  stats: CategoryStats[],
  categoryName: string,
): CategoryStats | null =>
  stats.find(s => s.category === categoryName) ?? null

export const shouldShowCategoryStats = (stats: CategoryStats | null): boolean =>
  !!stats && stats.projects >= CATEGORY_STATS_MIN_PROJECTS

/** "~4 h", "~1 dag", "~3 dagar" – svensk, avrundad presentation av svarstid. */
export const formatResponseTime = (hours: number | null): string | null => {
  if (hours === null || hours < 0) return null
  if (hours < 1) return 'inom en timme'
  if (hours < 24) return `~${Math.max(1, hours)} h`
  const days = Math.round(hours / 24)
  return days === 1 ? '~1 dag' : `~${days} dagar`
}
