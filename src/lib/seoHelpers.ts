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
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export interface SEOMeta {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
}

export const setSEOMeta = (meta: SEOMeta) => {
  const { title, description, canonical, ogImage, ogType = 'website', noindex } = meta

  // Title
  document.title = title

  // Meta description
  setOrCreateMeta('description', description)

  // Canonical
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  const canonicalUrl = canonical || `${SITE_URL}${window.location.pathname}`
  if (link) {
    link.href = canonicalUrl
  } else {
    link = document.createElement('link')
    link.rel = 'canonical'
    link.href = canonicalUrl
    document.head.appendChild(link)
  }

  // Open Graph
  setOrCreateMetaProperty('og:title', title)
  setOrCreateMetaProperty('og:description', description)
  setOrCreateMetaProperty('og:url', canonicalUrl)
  setOrCreateMetaProperty('og:type', ogType)
  setOrCreateMetaProperty('og:image', ogImage || DEFAULT_OG_IMAGE)
  setOrCreateMetaProperty('og:site_name', SITE_NAME)
  setOrCreateMetaProperty('og:locale', 'sv_SE')

  // Twitter
  setOrCreateMeta('twitter:card', 'summary_large_image')
  setOrCreateMeta('twitter:title', title)
  setOrCreateMeta('twitter:description', description)
  setOrCreateMeta('twitter:image', ogImage || DEFAULT_OG_IMAGE)

  // Robots
  if (noindex) {
    setOrCreateMeta('robots', 'noindex, nofollow')
  } else {
    const robotsMeta = document.querySelector('meta[name="robots"]')
    if (robotsMeta) robotsMeta.remove()
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
