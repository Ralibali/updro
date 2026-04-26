/**
 * SEO Helpers – Centralized meta tag, canonical, and OG management
 */

import { SEO_PAGES } from './seoData'
import { CITIES, SERVICE_CATEGORIES } from './seoCities'
import { COMPARISON_PAGES } from './seoComparisons'
import { ARTICLES } from './seoArticles'
import { TOOLS } from './seoTools'

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
  title: string
  description: string
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
 * Stable, idempotent SEO setter.
 * - Indexable pages always get full robots directive (NEVER removes the robots tag).
 * - Canonical is always present, self-referential by default.
 * - OG / Twitter metadata is always updated for every page.
 * - Noindex pages get noindex,nofollow AND a canonical pointing to themselves
 *   (never inheriting the home canonical), so they don't inherit signals.
 */
export const setSEOMeta = (meta: SEOMeta) => {
  if (typeof document === 'undefined') return
  const { title, description, canonical, ogImage, ogType = 'website', noindex, ogUrl } = meta

  // Title
  if (document.title !== title) document.title = title

  // Description
  setOrCreateMeta('description', description)

  // Canonical (always present, never removed)
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
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

export interface SitemapEntry {
  loc: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: number
}

/**
 * Generate all sitemap entries with metadata
 */
export const getAllSitemapEntries = (): SitemapEntry[] => {
  const entries: SitemapEntry[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/publicera', changefreq: 'weekly', priority: 0.8 },
    { loc: '/byraer', changefreq: 'weekly', priority: 0.8 },
    { loc: '/priser', changefreq: 'weekly', priority: 0.8 },
    { loc: '/om-oss', changefreq: 'monthly', priority: 0.6 },
    { loc: '/artiklar', changefreq: 'weekly', priority: 0.8 },
    { loc: '/verktyg', changefreq: 'weekly', priority: 0.8 },
    { loc: '/stader', changefreq: 'weekly', priority: 0.8 },
    { loc: '/jamfor', changefreq: 'weekly', priority: 0.8 },
    { loc: '/guider', changefreq: 'weekly', priority: 0.7 },
    { loc: '/integritetspolicy', changefreq: 'monthly', priority: 0.3 },
    { loc: '/villkor', changefreq: 'monthly', priority: 0.3 },
  ]

  // Pillar + sub pages
  for (const page of SEO_PAGES) {
    entries.push({ loc: `/${page.categorySlug}`, changefreq: 'weekly', priority: 0.9 })
    for (const sub of page.subPages) {
      entries.push({ loc: `/${page.categorySlug}/${sub.slug}`, changefreq: 'weekly', priority: 0.7 })
    }
  }

  // City hubs
  for (const city of CITIES) {
    entries.push({ loc: `/stader/${city.slug}`, changefreq: 'weekly', priority: 0.7 })
  }

  // Comparison pages
  for (const comp of COMPARISON_PAGES) {
    entries.push({ loc: `/${comp.slug}`, changefreq: 'monthly', priority: 0.8 })
  }

  // Articles
  for (const article of ARTICLES) {
    entries.push({ loc: `/artiklar/${article.slug}`, changefreq: 'monthly', priority: 0.7 })
  }

  // Tools
  for (const tool of TOOLS) {
    entries.push({ loc: `/verktyg/${tool.slug}`, changefreq: 'monthly', priority: 0.7 })
  }

  return entries
}

/**
 * Generate sitemap XML string
 */
export const generateSitemapXml = (): string => {
  const entries = getAllSitemapEntries()
  const today = new Date().toISOString().split('T')[0]

  const urls = entries.map(e =>
    `  <url><loc>https://updro.se${e.loc}</loc><lastmod>${today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export const SITE_URL_BASE = SITE_URL
