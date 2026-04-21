/**
 * Sitemap generator – single source of truth for all sitemap URLs.
 *
 * Used by both:
 *   - The static public/sitemap.xml (regenerate via `npm run sitemap:generate`)
 *   - The Supabase edge function supabase/functions/sitemap (runtime)
 */

import { CITIES, SERVICE_CATEGORIES } from './seoCities'
import { ARTICLES } from './seoArticles'
import { TOOLS } from './seoTools'
import { COMPARISON_PAGES } from './seoComparisons'
import { SEO_PAGES } from './seoData'
import { SEO_KNOWLEDGE_ARTICLES } from './seoAgencyData'

const SITE_URL = 'https://updro.se'
export const SITEMAP_LASTMOD = '2026-04-15'

export interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
}

const u = (path: string, changefreq: SitemapUrl['changefreq'], priority: number, lastmod = SITEMAP_LASTMOD): SitemapUrl => ({
  loc: `${SITE_URL}${path}`,
  lastmod,
  changefreq,
  priority,
})

// ─── Static / core ───
export const getCoreUrls = (): SitemapUrl[] => [
  u('/', 'daily', 1.0),
  u('/publicera', 'weekly', 0.9),
  u('/byraer', 'weekly', 0.9),
  u('/priser', 'weekly', 0.8),
  u('/om-oss', 'monthly', 0.6),
  u('/registrera/byra', 'monthly', 0.7),
  u('/guider', 'weekly', 0.7),
  u('/artiklar', 'weekly', 0.8),
  u('/verktyg', 'weekly', 0.8),
  u('/stader', 'weekly', 0.8),
  u('/jamfor', 'weekly', 0.8),
  u('/kunskapsbank', 'weekly', 0.8),
  u('/hitta-webbyra', 'weekly', 0.9),
  u('/hitta-seo-byra', 'weekly', 0.9),
  u('/hitta-digital-byra', 'weekly', 0.9),
  u('/integritetspolicy', 'yearly', 0.3),
  u('/villkor', 'yearly', 0.3),
  u('/cookies', 'yearly', 0.3),
]

// ─── Pillar / sub pages ───
export const getPillarUrls = (): SitemapUrl[] => {
  const out: SitemapUrl[] = []
  for (const p of SEO_PAGES) {
    out.push(u(`/${p.categorySlug}`, 'weekly', 0.9))
    for (const sub of p.subPages) out.push(u(`/${p.categorySlug}/${sub.slug}`, 'monthly', 0.7))
  }
  return out
}

// ─── City × Category programmatic pages (25 × 10 = 250) ───
export const getCityCategoryUrls = (): SitemapUrl[] => {
  const out: SitemapUrl[] = []
  for (const city of CITIES) {
    out.push(u(`/byraer/${city.slug}`, 'weekly', 0.8))
    out.push(u(`/stader/${city.slug}`, 'weekly', 0.7))
    for (const cat of SERVICE_CATEGORIES) {
      out.push(u(`/byraer/${city.slug}/${cat.slug}`, 'monthly', 0.7))
    }
  }
  return out
}

// ─── Articles ───
export const getArticleUrls = (): SitemapUrl[] => [
  ...ARTICLES.map(a => u(`/artiklar/${a.slug}`, 'monthly', 0.7)),
  ...SEO_KNOWLEDGE_ARTICLES.map(a => u(`/kunskapsbank/${a.slug}`, 'monthly', 0.7)),
]

// ─── Tools + comparisons ───
export const getToolUrls = (): SitemapUrl[] =>
  TOOLS.map(t => u(`/verktyg/${t.slug}`, 'monthly', 0.7))

export const getComparisonUrls = (): SitemapUrl[] =>
  COMPARISON_PAGES.map(c => u(`/${c.slug}`, 'monthly', 0.8))

// ─── Aggregate ───
export const getAllUrls = (): SitemapUrl[] => [
  ...getCoreUrls(),
  ...getPillarUrls(),
  ...getCityCategoryUrls(),
  ...getArticleUrls(),
  ...getToolUrls(),
  ...getComparisonUrls(),
]

// ─── XML rendering ───
const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const renderUrlset = (urls: SitemapUrl[]): string => {
  const items = urls.map(x =>
    `  <url><loc>${xmlEscape(x.loc)}</loc><lastmod>${x.lastmod}</lastmod><changefreq>${x.changefreq}</changefreq><priority>${x.priority.toFixed(1)}</priority></url>`
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`
}

const renderSitemapIndex = (paths: string[]): string => {
  const items = paths.map(p =>
    `  <sitemap><loc>${SITE_URL}${p}</loc><lastmod>${SITEMAP_LASTMOD}</lastmod></sitemap>`
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`
}

export const buildMainSitemapXml = () => renderUrlset([
  ...getCoreUrls(), ...getPillarUrls(), ...getToolUrls(), ...getComparisonUrls(),
])
export const buildCitiesSitemapXml = () => renderUrlset(getCityCategoryUrls())
export const buildArticlesSitemapXml = () => renderUrlset(getArticleUrls())
export const buildSitemapIndexXml = () => renderSitemapIndex([
  '/sitemap-main.xml', '/sitemap-cities.xml', '/sitemap-articles.xml',
])

export const buildSingleSitemapXml = () => renderUrlset(getAllUrls())
