// Deterministic, pure helpers for the admin prospecting feature.
// Kept side-effect free so they can be unit-tested and shared between the
// edge function and the admin UI.

export type ProspectingNeedType = 'webb' | 'ehandel' | 'ai' | 'valfritt'
export type ProspectingSignalFocus = 'any' | 'buying' | 'growth' | 'pain'

export interface BuildQueryInput {
  freeText: string
  needType: ProspectingNeedType
  signalFocus?: ProspectingSignalFocus
  industry?: string | null
  location?: string | null
}

/**
 * Domains we never want to persist as leads: aggregators, directories and
 * social platforms. The list is intentionally conservative — only add entries
 * we are confident are not real supplier websites.
 */
export const DIRECTORY_DOMAINS: readonly string[] = [
  'linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'youtube.com', 'tiktok.com', 'pinterest.com', 'reddit.com',
  'hitta.se', 'eniro.se', 'allabolag.se', 'ratsit.se', 'bolagsfakta.se',
  'reco.se', 'yelp.com', 'yellowpages.com',
  'google.com', 'bing.com', 'duckduckgo.com',
  'wikipedia.org', 'wikimedia.org',
  'medium.com', 'substack.com',
] as const

const CONTACT_HINTS = [
  '/kontakt', '/kontakta', '/kontakta-oss', '/contact', '/contact-us',
  '/om-oss/kontakt', '/hitta-hit',
]

const NEED_TERMS: Record<ProspectingNeedType, string> = {
  webb: 'ny hemsida OR "gammal hemsida" OR "bygga om webbplatsen"',
  ehandel: '"webbshop" OR "e-handel" OR "onlinebutik"',
  ai: '"vill använda AI" OR "AI-lösning" OR "automatisera"',
  valfritt: '',
}

const SIGNAL_TERMS: Record<ProspectingSignalFocus, string> = {
  any: '',
  buying: '"söker byrå" OR "söker leverantör" OR "behöver hjälp" OR "offertförfrågan" OR upphandling OR "request for proposal" OR "request for quote"',
  growth: '"öppnar nytt" OR expanderar OR expansion OR "ny butik" OR "nytt kontor" OR rekryterar OR "we are hiring"',
  pain: '"manuellt arbete" OR excel OR "tar för lång tid" OR "gammal hemsida" OR "under ombyggnad" OR "problem med"',
}

/** Build the Firecrawl search query from admin form inputs. Deterministic. */
export function buildProspectingQuery(input: BuildQueryInput): string {
  const parts: string[] = []
  const free = input.freeText?.trim()
  if (free) parts.push(free)
  const need = NEED_TERMS[input.needType]
  if (need) parts.push(`(${need})`)
  const signal = SIGNAL_TERMS[input.signalFocus ?? 'any']
  if (signal) parts.push(`(${signal})`)
  if (input.industry?.trim()) parts.push(`"${input.industry.trim()}"`)
  if (input.location?.trim()) parts.push(input.location.trim())
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Normalise a URL to a bare registrable domain (lowercase, no port, no www,
 * no path). Returns null when the input is not a parseable http(s) URL.
 */
export function normalizeDomain(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  const trimmed = String(rawUrl).trim()
  if (!trimmed) return null
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const u = new URL(withProto)
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    return host || null
  } catch {
    return null
  }
}

/** True if the domain matches (or is a subdomain of) a directory/aggregator. */
export function isDirectoryDomain(domain: string | null | undefined): boolean {
  if (!domain) return true
  const d = domain.toLowerCase()
  return DIRECTORY_DOMAINS.some((bad) => d === bad || d.endsWith(`.${bad}`))
}

/**
 * Pick the most likely public contact page from a page's links list.
 * Only returns links on the same registrable domain. Never scrapes emails.
 */
export function pickContactPage(baseDomain: string, links: readonly string[] | undefined | null): string | null {
  if (!links || links.length === 0) return null
  for (const link of links) {
    const domain = normalizeDomain(link)
    if (!domain) continue
    if (domain !== baseDomain && !domain.endsWith(`.${baseDomain}`)) continue
    const lower = link.toLowerCase()
    if (CONTACT_HINTS.some((hint) => lower.includes(hint))) return link
  }
  return null
}

export interface FitScoreInput {
  needType: ProspectingNeedType
  industry?: string | null
  location?: string | null
  markdown?: string | null
  contactPageUrl?: string | null
  publishedAt?: string | null
}

export interface FitScoreResult {
  score: number
  signals: string[]
}

/**
 * Deterministic 0–100 fit score. Every signal that contributes points is
 * also returned so the UI can explain the score. We never present assumed
 * needs as facts — signals are observations of the scanned page.
 */
export function computeFitScore(input: FitScoreInput): FitScoreResult {
  const signals: string[] = []
  let score = 30
  const md = (input.markdown || '').toLowerCase()

  if (input.contactPageUrl) {
    score += 15
    signals.push('Publik kontaktsida hittad')
  }

  if (input.industry?.trim() && md.includes(input.industry.toLowerCase())) {
    score += 15
    signals.push(`Bransch omnämnd på sidan: ${input.industry}`)
  }

  if (input.location?.trim()) {
    const loc = input.location.toLowerCase()
    if (md.includes(loc)) {
      score += 10
      signals.push(`Ort/region omnämnd: ${input.location}`)
    }
  }

  // Copyright-year hint: old year suggests site not updated.
  const currentYear = new Date().getUTCFullYear()
  const yearMatch = md.match(/©\s*(19\d{2}|20\d{2})/)
  if (yearMatch) {
    const year = Number(yearMatch[1])
    if (Number.isFinite(year) && currentYear - year >= 2) {
      score += 15
      signals.push(`Gammalt copyright-år: ${year}`)
    }
  }

  if (/(under\s+ombyggnad|under\s+construction|kommer\s+snart|tillfällig\s+sida)/.test(md)) {
    score += 15
    signals.push('Sidan uppges vara under ombyggnad eller tillfällig')
  }

  if (input.needType === 'ehandel' && /(webbshop|e-handel|onlinebutik|köp\s+online)/.test(md)) {
    score += 5
    signals.push('Text om e-handel eller onlinebutik')
  }
  if (input.needType === 'ai' && /(ai|artificiell\s+intelligens|automatiser)/.test(md)) {
    score += 5
    signals.push('Text om AI eller automatisering')
  }
  if (input.needType === 'webb' && /(gammal\s+hemsida|ny\s+hemsida|bygga\s+om\s+webbplats)/.test(md)) {
    score += 5
    signals.push('Text om ny/gammal hemsida')
  }

  if (/(söker\s+(?:en\s+)?(?:byrå|leverantör|partner)|behöver\s+hjälp|offertförfrågan|request\s+for\s+(?:proposal|quote)|upphandling)/.test(md)) {
    score += 20
    signals.push('Köpsignal: aktivt behov eller leverantörssökande omnämns')
  }
  if (/(öppnar\s+(?:ny|nytt)|expanderar|expansion|ny\s+(?:butik|lokal|kontor)|rekryterar|we\s+are\s+hiring)/.test(md)) {
    score += 15
    signals.push('Tillväxtsignal: expansion, nyetablering eller rekrytering omnämns')
  }
  if (/(manuellt\s+arbete|excel|tar\s+för\s+lång\s+tid|gammal\s+hemsida|under\s+ombyggnad|problem\s+med)/.test(md)) {
    score += 12
    signals.push('Problemsignal: ett konkret manuellt, tekniskt eller digitalt problem omnämns')
  }

  if (input.publishedAt) {
    const published = new Date(input.publishedAt)
    const ageMs = Date.now() - published.getTime()
    if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= 90 * 24 * 60 * 60 * 1000) {
      score += 10
      signals.push(`Färsk källa: ${published.toISOString().slice(0, 10)}`)
    }
  }

  // Missing clear CTA is a mild signal that the site could be improved.
  if (md && !/(kontakta\s+oss|boka|offert|kom\s+igång|prova\s+gratis)/.test(md)) {
    score += 5
    signals.push('Ingen tydlig CTA på den skannade sidan')
  }

  if (score > 100) score = 100
  if (score < 0) score = 0
  return { score, signals }
}
