/**
 * Live-räknare till startsidans StatsSection. Hämtas från edge-funktionen
 * marketplace-stats. Visas bara när siffrorna är tillräckligt höga för att
 * vara trovärdiga – annars faller vi tillbaka på plattformens löften
 * (max 3 byråer, 2 min, gratis), som alltid är sanna.
 */

export interface MarketplaceStats {
  projects: number
  offers: number
  agencies: number
}

export interface StatDisplay {
  target: number
  suffix: string
  label: string
}

/** Tröskel: visa inte "12 uppdrag" – det skrämmer fler än det övertygar. */
export const LIVE_STATS_MIN_PROJECTS = 50

export const FALLBACK_STATS: StatDisplay[] = [
  { target: 3, suffix: '', label: 'byråer, max – kvalitet före volym' },
  { target: 2, suffix: '', label: 'minuter att beskriva ditt projekt' },
  { target: 100, suffix: '%', label: 'gratis för dig som beställare' },
]

export const isValidStats = (raw: unknown): raw is MarketplaceStats => {
  if (!raw || typeof raw !== 'object') return false
  const s = raw as Partial<MarketplaceStats>
  return (
    typeof s.projects === 'number' && s.projects >= 0 &&
    typeof s.offers === 'number' && s.offers >= 0 &&
    typeof s.agencies === 'number' && s.agencies >= 0
  )
}

/** Live-siffror bara när tröskeln är nådd – aldrig pinsamma låga tal. */
export const shouldShowLiveStats = (stats: MarketplaceStats | null): boolean =>
  !!stats && stats.projects >= LIVE_STATS_MIN_PROJECTS

export const buildLiveStats = (stats: MarketplaceStats): StatDisplay[] => [
  { target: stats.projects, suffix: '', label: 'uppdrag publicerade hittills' },
  { target: stats.offers, suffix: '', label: 'offerter lämnade av byråer' },
  { target: stats.agencies, suffix: '', label: 'byråer redo att svara' },
]

export const resolveStats = (stats: MarketplaceStats | null): { stats: StatDisplay[]; isLive: boolean } =>
  shouldShowLiveStats(stats)
    ? { stats: buildLiveStats(stats as MarketplaceStats), isLive: true }
    : { stats: FALLBACK_STATS, isLive: false }
