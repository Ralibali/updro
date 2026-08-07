/// <reference lib="dom" />
/**
 * SEO Helpers – Centralized meta tag, canonical, and OG management
 */


const SITE_URL = 'https://updro.se'
const SITE_NAME = 'Updro'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/og-default.png`

/** Map category slugs to OG images */
const OG_IMAGE_MAP: Record<string, string> = {
  webbutveckling: '/og/og-webbutveckling.png',
  seo: '/og/og-seo.png',
  'google-ads': '/og/og-google-ads.png',
  ehandel: '/og/og-ehandel.png',
  'digital-marknadsforing': '/og/og-digital-marknadsforing.png',
  apputveckling: '/og/og-apputveckling.png',
  artiklar: '/og/og-artiklar.png',
  jamfor: '/og/og-jamfor.png',
}

/** Get the best OG image URL for a given category slug */
export const getOgImage = (categorySlug?: string): string => {
  if (!categorySlug) return DEFAULT_OG_IMAGE
  const match = OG_IMAGE_MAP[categorySlug]
  if (match) return `${SITE_URL}${match}`
  // Try partial match (e.g. 'basta-seo-byran' -> 'seo')
  for (const [key, path] of Object.entries(OG_IMAGE_MAP)) {
    if (categorySlug.includes(key)) return `${SITE_URL}${path}`
  }
  return DEFAULT_OG_IMAGE
}

export interface SEOMeta {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
  /** Override og:url specifically (defaults to canonical) */
  ogUrl?: string
}

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const ROBOTS_NOINDEX = 'noindex, nofollow'

/**
 * Per-pagetype defaults. Used as a safety net when a page forgets to pass
 * title/description so we never ship empty metadata to crawlers.
 * Inferred from URL prefix.
 */
interface PageTypeDefault {
  title: string
  description: string
}

const PAGE_TYPE_DEFAULTS: Array<{ test: (path: string) => boolean; key: string; defaults: PageTypeDefault }> = [
  { key: 'home', test: p => p === '/', defaults: {
    title: 'Updro – Hitta rätt byrå för ditt projekt',
    description: 'Updro är marknadsplatsen för digitala projekt. Publicera ditt uppdrag gratis och få offerter från kvalitetssäkrade byråer i Sverige.',
  }},
  { key: 'artiklar', test: p => p.startsWith('/artiklar'), defaults: {
    title: 'Artiklar & guider om digitala projekt | Updro',
    description: 'Praktiska guider om webb, SEO, e-handel och digital marknadsföring – skrivna för dig som ska beställa ett projekt.',
  }},
  { key: 'verktyg', test: p => p.startsWith('/verktyg'), defaults: {
    title: 'Gratis verktyg för digitala projekt | Updro',
    description: 'Kalkylatorer och mallar som hjälper dig planera, prissätta och kravställa ditt nästa digitala projekt.',
  }},
  { key: 'jamfor', test: p => p.startsWith('/jamfor') || /^\/basta-/.test(p), defaults: {
    title: 'Jämför bästa byråerna i Sverige | Updro',
    description: 'Oberoende jämförelser av Sveriges bästa byråer inom webb, SEO, e-handel och digital marknadsföring.',
  }},
  { key: 'byraer', test: p => p.startsWith('/byraer'), defaults: {
    title: 'Hitta byråer i Sverige | Updro',
    description: 'Bläddra bland kvalitetssäkrade byråer per stad och kategori. Hitta rätt partner för ditt nästa projekt.',
  }},
  { key: 'stader', test: p => p.startsWith('/stader'), defaults: {
    title: 'Byråer per stad i Sverige | Updro',
    description: 'Hitta lokala byråer i din stad. Översikt över utbud, specialiteter och prisnivå.',
  }},
  { key: 'kunskapsbank', test: p => p.startsWith('/kunskapsbank'), defaults: {
    title: 'Kunskapsbank | Updro',
    description: 'Fördjupande material och guider för dig som ska köpa eller leverera digitala tjänster.',
  }},
  { key: 'guider', test: p => p.startsWith('/guider'), defaults: {
    title: 'Guider | Updro',
    description: 'Steg-för-steg-guider för att lyckas med digitala projekt.',
  }},
]

const FALLBACK_DEFAULT: PageTypeDefault = {
  title: 'Updro – Marknadsplats för digitala byråer',
  description: 'Publicera ditt uppdrag gratis och hitta rätt byrå i Sverige.',
}

const isDev = (() => {
  try {
    // import.meta.env.DEV is exposed by Vite at build time
    return Boolean((import.meta as any)?.env?.DEV)
  } catch {
    return false
  }
})()

function resolvePageDefaults(path: string): { defaults: PageTypeDefault; key: string } {
  const match = PAGE_TYPE_DEFAULTS.find(d => d.test(path))
  if (match) return { defaults: match.defaults, key: match.key }
  return { defaults: FALLBACK_DEFAULT, key: 'fallback' }
}

/**
 * Stable, idempotent SEO setter.
 * - Indexable pages always get full robots directive (NEVER removes the robots tag).
 * - Canonical is always present, self-referential by default.
 * - OG / Twitter metadata is always updated for every page.
 * - Noindex pages get noindex,nofollow AND a canonical pointing to themselves
 *   (never inheriting the home canonical), so they don't inherit signals.
 * - Missing title/description fall back to a clear per-pagetype default and
 *   emit a dev-only console warning so metadata is never empty in production.
 */
export const setSEOMeta = (meta: SEOMeta) => {
  if (typeof document === 'undefined') return
  const { canonical, ogImage, ogType = 'website', noindex, ogUrl } = meta

  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  const { defaults, key } = resolvePageDefaults(path)

  let title = (meta.title ?? '').trim()
  let description = (meta.description ?? '').trim()

  if (!title) {
    if (isDev) {
      console.warn(
        `[SEO] Missing title on "${path}" — falling back to "${key}" default. ` +
        `Pass an explicit title to setSEOMeta() to silence this warning.`
      )
    }
    title = defaults.title
  }

  if (!description) {
    if (isDev) {
      console.warn(
        `[SEO] Missing description on "${path}" — falling back to "${key}" default. ` +
        `Pass an explicit description to setSEOMeta() to silence this warning.`
      )
    }
    description = defaults.description
  }

  // Title
  if (document.title !== title) document.title = title

  // Description
  setOrCreateMeta('description', description)

  // Canonical (always present, never removed)
  const canonicalUrl = canonical || `${SITE_URL}${path}`
  setOrCreateLink('canonical', canonicalUrl)

  // Robots — ALWAYS present, never removed
  setOrCreateMeta('robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX)

  const finalOgImage = ogImage || DEFAULT_OG_IMAGE
  const finalOgUrl = ogUrl || canonicalUrl

  // Open Graph
  setOrCreateMetaProperty('og:title', title)
  setOrCreateMetaProperty('og:description', description)
  setOrCreateMetaProperty('og:url', finalOgUrl)
  setOrCreateMetaProperty('og:type', ogType)
  setOrCreateMetaProperty('og:image', finalOgImage)
  setOrCreateMetaProperty('og:site_name', SITE_NAME)
  setOrCreateMetaProperty('og:locale', 'sv_SE')

  // Twitter
  setOrCreateMeta('twitter:card', 'summary_large_image')
  setOrCreateMeta('twitter:title', title)
  setOrCreateMeta('twitter:description', description)
  setOrCreateMeta('twitter:image', finalOgImage)
}

function setOrCreateLink(rel: string, href: string) {
  // Remove any duplicates first to enforce single instance
  const all = document.querySelectorAll(`link[rel="${rel}"]`)
  if (all.length > 1) {
    for (let i = 1; i < all.length; i++) all[i].remove()
  }
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (el) {
    if (el.href !== href) el.href = href
  } else {
    el = document.createElement('link')
    el.rel = rel
    el.href = href
    document.head.appendChild(el)
  }
}

function setOrCreateMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (el) {
    el.content = content
  } else {
    el = document.createElement('meta')
    el.name = name
    el.content = content
    document.head.appendChild(el)
  }
}

function setOrCreateMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (el) {
    el.setAttribute('content', content)
  } else {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    el.setAttribute('content', content)
    document.head.appendChild(el)
  }
}

/**
 * Inject a JSON-LD <script> tag into <head> with a unique id.
 * Removes any existing script with the same id first to prevent duplicates
 * when navigating between pages.
 */
export const setJsonLd = (id: string, data: object) => {
  if (typeof document === 'undefined') return
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * Generate and inject a BreadcrumbList JSON-LD from a list of items.
 * Items should be ordered from root → current page.
 */
export const setBreadcrumb = (items: { name: string; url: string }[]) => {
  setJsonLd('breadcrumb-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  })
}
