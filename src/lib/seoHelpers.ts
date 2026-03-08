/**
 * SEO Helpers – Centralized meta tag, canonical, and OG management
 */

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

/**
 * Generate all URLs for sitemap
 */
export const getAllSiteUrls = (): string[] => {
  // Lazy imports to avoid circular deps
  const { SEO_PAGES } = require('./seoData')
  const { CITIES, SERVICE_CATEGORIES } = require('./seoCities')
  const { COMPARISON_PAGES } = require('./seoComparisons')
  const { ARTICLES } = require('./seoArticles')
  const { TOOLS } = require('./seoTools')

  const urls: string[] = [
    '/',
    '/publicera',
    '/byraer',
    '/priser',
    '/om-oss',
    '/artiklar',
    '/verktyg',
    '/stader',
    '/jamfor',
  ]

  // Pillar + sub pages
  for (const page of SEO_PAGES) {
    urls.push(`/${page.categorySlug}`)
    for (const sub of page.subPages) {
      urls.push(`/${page.categorySlug}/${sub.slug}`)
    }
  }

  // City hubs
  for (const city of CITIES) {
    urls.push(`/stader/${city.slug}`)
  }

  // City × Service pages
  for (const city of CITIES) {
    for (const service of SERVICE_CATEGORIES) {
      urls.push(`/${service.slug}/${city.slug}`)
    }
  }

  // Comparison pages
  for (const comp of COMPARISON_PAGES) {
    urls.push(`/${comp.slug}`)
  }

  // Articles
  for (const article of ARTICLES) {
    urls.push(`/artiklar/${article.slug}`)
  }

  // Tools
  for (const tool of TOOLS) {
    urls.push(`/verktyg/${tool.slug}`)
  }

  return urls
}

export const SITE_URL_BASE = SITE_URL
