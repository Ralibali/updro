/**
 * Build-time static HTML prerendering for SEO.
 *
 * The app is a React SPA. This module writes route-specific HTML files into
 * dist/ after Vite has built the app, so crawlers get unique titles,
 * descriptions, canonicals, JSON-LD and semantic body content without waiting
 * for client-side JavaScript.
 *
 * It intentionally avoids Puppeteer/Chromium so it works in static hosting
 * environments such as Lovable, Netlify, Vercel and Cloudflare Pages.
 */

import fs from 'node:fs'
import path from 'node:path'
import { SEO_PAGES } from '../lib/seoData'
import { CITIES, SERVICE_CATEGORIES } from '../lib/seoCities'
import { COMPARISON_PAGES } from '../lib/seoComparisons'
import { ARTICLES } from '../lib/seoArticles'
import { TOOLS } from '../lib/seoTools'

const SITE_URL = 'https://updro.se'
const DEFAULT_OG = `${SITE_URL}/og-image.png`

const OG_BY_CATEGORY: Record<string, string> = {
  webbutveckling: `${SITE_URL}/og/og-webbutveckling.png`,
  seo: `${SITE_URL}/og/og-seo.png`,
  'google-ads': `${SITE_URL}/og/og-google-ads.png`,
  ehandel: `${SITE_URL}/og/og-ehandel.png`,
  'digital-marknadsforing': `${SITE_URL}/og/og-digital-marknadsforing.png`,
  apputveckling: `${SITE_URL}/og/og-apputveckling.png`,
  artiklar: `${SITE_URL}/og/og-artiklar.png`,
  jamfor: `${SITE_URL}/og/og-jamfor.png`,
}

interface RouteMeta {
  path: string
  title: string
  description: string
  h1?: string
  intro?: string
  sections?: { heading: string; content: string }[]
  faq?: { q: string; a: string }[]
  relatedLinks?: { label: string; href: string }[]
  breadcrumbs: { name: string; url: string }[]
  ogImage?: string
  type?: 'website' | 'article'
  publishedDate?: string
  updatedDate?: string
  category?: string
  schemaType?: 'WebPage' | 'Article' | 'Service' | 'CollectionPage' | 'FAQPage' | 'AboutPage'
}

const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const clampDesc = (value: unknown): string => {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= 160) return clean
  const cut = clean.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return `${lastSpace > 120 ? cut.slice(0, lastSpace) : cut}…`
}

const slugIncludes = (slug: string, key: string) => slug === key || slug.includes(key)

const pickOg = (slug?: string): string => {
  const safeSlug = slug || ''
  for (const [key, image] of Object.entries(OG_BY_CATEGORY)) {
    if (slugIncludes(safeSlug, key)) return image
  }
  return DEFAULT_OG
}

const absUrl = (routePath: string): string => `${SITE_URL}${routePath}`
const crumb = (...items: { name: string; url: string }[]) => items

const normalizeSections = (sections: unknown): { heading: string; content: string }[] | undefined => {
  if (!Array.isArray(sections)) return undefined
  return sections
    .map((section: any) => ({
      heading: String(section?.heading || section?.title || '').trim(),
      content: String(section?.content || section?.body || section?.text || '').trim(),
    }))
    .filter(section => section.heading || section.content)
}

const normalizeFaq = (faq: unknown): { q: string; a: string }[] | undefined => {
  if (!Array.isArray(faq)) return undefined
  return faq
    .map((item: any) => ({
      q: String(item?.q || item?.question || '').trim(),
      a: String(item?.a || item?.answer || '').trim(),
    }))
    .filter(item => item.q && item.a)
}

const normalizeLinks = (links: unknown): { label: string; href: string }[] | undefined => {
  if (!Array.isArray(links)) return undefined
  return links
    .map((link: any) => ({
      label: String(link?.label || link?.title || link?.name || '').trim(),
      href: String(link?.href || link?.url || '').trim(),
    }))
    .filter(link => link.label && link.href)
}

const inlineFmt = (value: string): string =>
  esc(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

const markdownToHtml = (value: unknown): string => {
  const lines = String(value ?? '').split('\n').map(line => line.trim())
  const out: string[] = []
  let inList = false

  for (const line of lines) {
    if (!line) {
      if (inList) {
        out.push('</ul>')
        inList = false
      }
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inlineFmt(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }

    if (/^\|.*\|$/.test(line)) continue

    if (inList) {
      out.push('</ul>')
      inList = false
    }
    out.push(`<p>${inlineFmt(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  return out.join('\n')
}

const addRoute = (routes: RouteMeta[], route: RouteMeta) => {
  if (!route.path.startsWith('/')) route.path = `/${route.path}`
  if (routes.some(existing => existing.path === route.path)) return
  routes.push({
    ...route,
    description: clampDesc(route.description),
    ogImage: route.ogImage || DEFAULT_OG,
  })
}

const buildRoutes = (): RouteMeta[] => {
  const routes: RouteMeta[] = []

  addRoute(routes, {
    path: '/',
    title: 'Updro – Jämför offerter från webbyrå, SEO-byrå & UX-byrå i Sverige',
    description: 'Beskriv ditt projekt gratis och få upp till 5 offerter från kvalitetssäkrade digitala byråer inom 24 h. Webbutveckling, SEO, UX/UI, e-handel, Google Ads & apputveckling i hela Sverige.',
    h1: 'Hitta rätt byrå för ditt digitala projekt',
    intro: 'Updro är Sveriges marknadsplats för digitala uppdrag. Publicera ditt projekt gratis och få skräddarsydda offerter från kvalitetssäkrade digitala byråer inom 24 timmar.',
    breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }),
    schemaType: 'WebPage',
    relatedLinks: [
      { label: 'Publicera uppdrag', href: '/publicera' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Hitta SEO-byrå', href: '/hitta-seo-byra' },
      { label: 'Jämför byråer', href: '/jamfor' },
      { label: 'Artiklar', href: '/artiklar' },
    ],
  })

  const staticPages: RouteMeta[] = [
    ['publicera', 'Publicera uppdrag gratis – få offerter inom 24 h | Updro', 'Publicera ditt digitala uppdrag gratis på Updro och få upp till 5 offerter från kvalitetssäkrade byråer inom 24 timmar.', 'Publicera ditt uppdrag – kostnadsfritt'],
    ['byraer', 'Hitta digitala byråer i Sverige | Updro', 'Bläddra bland Sveriges kvalitetssäkrade digitala byråer. Filtrera på stad, specialitet och prisnivå.', 'Alla digitala byråer i Sverige'],
    ['priser', 'Priser – Så mycket kostar Updro för byråer | Updro', 'Transparenta priser för byråer på Updro. Betala endast för uppdrag du vill lämna offert på.', 'Priser för byråer'],
    ['om-oss', 'Om Updro – Sveriges marknadsplats för digitala uppdrag', 'Updro drivs av Aurora Media AB och är Sveriges marknadsplats för digitala uppdrag.', 'Om Updro'],
    ['artiklar', 'Artiklar & guider om digitala projekt | Updro', 'Praktiska guider om webb, SEO, UX, e-handel och digital marknadsföring.', 'Artiklar & guider'],
    ['verktyg', 'Gratis verktyg för digitala projekt | Updro', 'Gratis kalkylatorer och verktyg som hjälper dig planera och prissätta digitala projekt.', 'Gratis verktyg'],
    ['stader', 'Digitala byråer per stad i Sverige | Updro', 'Hitta lokala digitala byråer i din stad och jämför utbud, specialiteter och prisnivå.', 'Byråer per stad'],
    ['jamfor', 'Jämför bästa byråerna i Sverige 2026 | Updro', 'Oberoende jämförelser av Sveriges bästa byråer inom webb, SEO, UX, e-handel och digital marknadsföring.', 'Jämför bästa byråerna 2026'],
    ['hitta-webbyra', 'Hitta webbyrå – jämför byråer i Sverige | Updro', 'Hitta rätt webbyrå för ditt projekt. Jämför kvalitetssäkrade webbyråer i Sverige och få offerter gratis.', 'Hitta rätt webbyrå i Sverige'],
    ['hitta-seo-byra', 'Hitta SEO-byrå – jämför offerter i Sverige | Updro', 'Hitta rätt SEO-byrå för ditt företag. Jämför kvalitetssäkrade SEO-byråer och få offerter gratis.', 'Hitta rätt SEO-byrå i Sverige'],
    ['hitta-digital-byra', 'Hitta digital byrå – jämför i hela Sverige | Updro', 'Hitta rätt digital byrå för webb, SEO, UX, e-handel, Google Ads eller digital marknadsföring.', 'Hitta rätt digital byrå'],
    ['redaktionell-policy', 'Redaktionell policy | Updro', 'Så arbetar vi redaktionellt på Updro med oberoende, faktakontroll och tydlig metod.', 'Redaktionell policy'],
    ['metod', 'Så fungerar Updro – vår metod | Updro', 'Så kvalitetssäkrar vi byråer på Updro och matchar ditt uppdrag med rätt leverantör.', 'Vår metod'],
    ['integritetspolicy', 'Integritetspolicy | Updro', 'Så hanterar Updro personuppgifter, cookies och dataskydd.', 'Integritetspolicy'],
    ['villkor', 'Villkor | Updro', 'Användarvillkor för Updro och tjänsten för digitala uppdrag.', 'Villkor'],
    ['cookies', 'Cookiepolicy | Updro', 'Information om hur Updro använder cookies och samtycke.', 'Cookiepolicy'],
  ].map(([slug, title, description, h1]) => ({
    path: `/${slug}`,
    title,
    description,
    h1,
    intro: description,
    breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: h1, url: absUrl(`/${slug}`) }),
    schemaType: slug === 'artiklar' || slug === 'verktyg' || slug === 'stader' || slug === 'jamfor' || slug === 'byraer' ? 'CollectionPage' : 'WebPage',
    ogImage: pickOg(slug),
  } as RouteMeta))

  staticPages.forEach(route => addRoute(routes, route))

  for (const pillar of SEO_PAGES as any[]) {
    const categorySlug = String(pillar?.categorySlug || '').trim()
    if (!categorySlug) continue
    const categoryName = String(pillar?.categoryName || pillar?.h1 || categorySlug)

    addRoute(routes, {
      path: `/${categorySlug}`,
      title: String(pillar?.metaTitle || pillar?.title || categoryName),
      description: String(pillar?.metaDesc || pillar?.description || pillar?.intro || categoryName),
      h1: String(pillar?.h1 || categoryName),
      intro: String(pillar?.intro || pillar?.metaDesc || ''),
      sections: normalizeSections(pillar?.sections),
      faq: normalizeFaq(pillar?.faq),
      relatedLinks: Array.isArray(pillar?.subPages)
        ? pillar.subPages.slice(0, 8).map((sub: any) => ({ label: String(sub?.title || sub?.h1 || sub?.slug), href: `/${categorySlug}/${sub?.slug}` }))
        : undefined,
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: categoryName, url: absUrl(`/${categorySlug}`) }),
      schemaType: 'Service',
      ogImage: pickOg(categorySlug),
    })

    for (const sub of Array.isArray(pillar?.subPages) ? pillar.subPages : []) {
      const subSlug = String(sub?.slug || '').trim()
      if (!subSlug) continue
      addRoute(routes, {
        path: `/${categorySlug}/${subSlug}`,
        title: String(sub?.title || sub?.metaTitle || sub?.h1 || `${categoryName} – ${subSlug}`),
        description: String(sub?.metaDesc || sub?.description || sub?.intro || sub?.h1 || subSlug),
        h1: String(sub?.h1 || sub?.title || subSlug),
        intro: String(sub?.intro || sub?.metaDesc || ''),
        sections: normalizeSections(sub?.sections),
        faq: normalizeFaq(sub?.faq),
        relatedLinks: normalizeLinks(sub?.relatedLinks),
        breadcrumbs: crumb(
          { name: 'Hem', url: absUrl('/') },
          { name: categoryName, url: absUrl(`/${categorySlug}`) },
          { name: String(sub?.h1 || sub?.title || subSlug), url: absUrl(`/${categorySlug}/${subSlug}`) },
        ),
        schemaType: 'Service',
        ogImage: pickOg(categorySlug),
      })
    }
  }

  for (const comp of COMPARISON_PAGES as any[]) {
    const slug = String(comp?.slug || '').trim()
    if (!slug) continue
    addRoute(routes, {
      path: `/${slug}`,
      title: String(comp?.metaTitle || comp?.title || comp?.h1 || slug),
      description: String(comp?.metaDesc || comp?.description || comp?.intro || slug),
      h1: String(comp?.h1 || comp?.title || slug),
      intro: String(comp?.intro || comp?.metaDesc || ''),
      sections: normalizeSections(comp?.sections),
      faq: normalizeFaq(comp?.faq),
      relatedLinks: normalizeLinks(comp?.relatedLinks),
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Jämför', url: absUrl('/jamfor') }, { name: String(comp?.h1 || slug), url: absUrl(`/${slug}`) }),
      schemaType: 'Article',
      ogImage: pickOg(slug),
    })
  }

  for (const city of CITIES as any[]) {
    const citySlug = String(city?.slug || '').trim()
    const cityName = String(city?.name || citySlug)
    if (!citySlug) continue

    addRoute(routes, {
      path: `/stader/${citySlug}`,
      title: `Digitala byråer i ${cityName} – topp-lista 2026 | Updro`,
      description: `Hitta digitala byråer i ${cityName}. ${city?.techDescription || city?.description || 'Jämför offerter gratis på Updro.'}`,
      h1: `Digitala byråer i ${cityName}`,
      intro: String(city?.description || city?.techDescription || ''),
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Städer', url: absUrl('/stader') }, { name: cityName, url: absUrl(`/stader/${citySlug}`) }),
      schemaType: 'CollectionPage',
    })

    addRoute(routes, {
      path: `/byraer/${citySlug}`,
      title: `Byråer i ${cityName} – jämför & få offerter | Updro`,
      description: `Jämför digitala byråer i ${cityName}. Webb, SEO, UX, e-handel och marknadsföring.`,
      h1: `Digitala byråer i ${cityName}`,
      intro: `Hitta och jämför digitala byråer i ${cityName}.`,
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Byråer', url: absUrl('/byraer') }, { name: cityName, url: absUrl(`/byraer/${citySlug}`) }),
      schemaType: 'CollectionPage',
    })

    for (const cat of SERVICE_CATEGORIES as any[]) {
      const catSlug = String(cat?.slug || '').trim()
      if (!catSlug) continue
      const catName = String(cat?.name || cat?.shortName || catSlug)
      addRoute(routes, {
        path: `/byraer/${citySlug}/${catSlug}`,
        title: `${catName} i ${cityName} | Updro`,
        description: `Hitta ${catName.toLowerCase()} i ${cityName}. Jämför kvalitetssäkrade byråer och få offerter gratis.`,
        h1: `${catName} i ${cityName}`,
        intro: String(cat?.description || ''),
        breadcrumbs: crumb(
          { name: 'Hem', url: absUrl('/') },
          { name: 'Byråer', url: absUrl('/byraer') },
          { name: cityName, url: absUrl(`/byraer/${citySlug}`) },
          { name: catName, url: absUrl(`/byraer/${citySlug}/${catSlug}`) },
        ),
        schemaType: 'Service',
        ogImage: pickOg(catSlug),
      })
    }
  }

  for (const article of ARTICLES as any[]) {
    const slug = String(article?.slug || '').trim()
    if (!slug) continue
    addRoute(routes, {
      path: `/artiklar/${slug}`,
      title: String(article?.metaTitle || article?.title || article?.h1 || slug),
      description: String(article?.metaDesc || article?.description || article?.intro || slug),
      h1: String(article?.h1 || article?.title || slug),
      intro: String(article?.intro || article?.metaDesc || ''),
      sections: normalizeSections(article?.sections),
      faq: normalizeFaq(article?.faq),
      relatedLinks: normalizeLinks(article?.relatedLinks),
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Artiklar', url: absUrl('/artiklar') }, { name: String(article?.h1 || slug), url: absUrl(`/artiklar/${slug}`) }),
      schemaType: 'Article',
      type: 'article',
      publishedDate: article?.publishedDate,
      updatedDate: article?.updatedDate || article?.publishedDate,
      category: article?.category,
      ogImage: pickOg('artiklar'),
    })
  }

  for (const tool of TOOLS as any[]) {
    const slug = String(tool?.slug || '').trim()
    if (!slug) continue
    addRoute(routes, {
      path: `/verktyg/${slug}`,
      title: String(tool?.metaTitle || tool?.title || tool?.h1 || slug),
      description: String(tool?.metaDesc || tool?.description || tool?.intro || slug),
      h1: String(tool?.h1 || tool?.title || slug),
      intro: String(tool?.intro || tool?.description || ''),
      sections: [{ heading: 'Om verktyget', content: String(tool?.description || tool?.intro || '') }],
      relatedLinks: normalizeLinks(tool?.relatedLinks),
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Verktyg', url: absUrl('/verktyg') }, { name: String(tool?.h1 || slug), url: absUrl(`/verktyg/${slug}`) }),
      schemaType: 'WebPage',
    })
  }

  return routes
}

const renderBreadcrumbsHtml = (items: { name: string; url: string }[]): string => {
  const nodes = items.map((item, index) => {
    const last = index === items.length - 1
    return last
      ? `<li aria-current="page"><span>${esc(item.name)}</span></li>`
      : `<li><a href="${esc(item.url)}">${esc(item.name)}</a></li>`
  }).join('')
  return `<nav aria-label="Brödsmulor" class="prerender-breadcrumbs"><ol>${nodes}</ol></nav>`
}

const renderSectionsHtml = (sections?: { heading: string; content: string }[]): string => {
  if (!sections?.length) return ''
  return sections.map(section => `<section class="prerender-section"><h2>${esc(section.heading)}</h2>${markdownToHtml(section.content)}</section>`).join('\n')
}

const renderFaqHtml = (faq?: { q: string; a: string }[]): string => {
  if (!faq?.length) return ''
  return `<section class="prerender-faq"><h2>Vanliga frågor</h2>${faq.map(item => `<div class="prerender-faq-item"><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></div>`).join('\n')}</section>`
}

const renderRelatedLinksHtml = (links?: { label: string; href: string }[]): string => {
  if (!links?.length) return ''
  return `<nav class="prerender-related" aria-label="Relaterade sidor"><h2>Relaterat</h2><ul>${links.map(link => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('')}</ul></nav>`
}

const buildJsonLd = (route: RouteMeta): string => {
  const canonical = absUrl(route.path)
  const blocks: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: route.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ]

  if (route.schemaType === 'Article' || route.type === 'article') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: route.h1 || route.title,
      description: route.description,
      url: canonical,
      inLanguage: 'sv-SE',
      mainEntityOfPage: canonical,
      ...(route.publishedDate ? { datePublished: route.publishedDate } : {}),
      ...(route.updatedDate ? { dateModified: route.updatedDate } : {}),
      ...(route.category ? { articleSection: route.category } : {}),
      image: route.ogImage || DEFAULT_OG,
      author: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Updro' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    })
  } else if (route.schemaType === 'Service') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: route.h1 || route.title,
      description: route.description,
      url: canonical,
      areaServed: { '@type': 'Country', name: 'Sweden' },
      provider: { '@id': `${SITE_URL}/#organization` },
    })
  } else {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': route.schemaType || 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: route.title,
      description: route.description,
      inLanguage: 'sv-SE',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    })
  }

  if (route.faq?.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: route.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }

  return blocks.map(block => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join('\n')
}

export const buildRouteHtml = (template: string, route: RouteMeta): string => {
  const canonical = absUrl(route.path)
  const jsonLd = buildJsonLd(route)
  const bodyShell = `
    <main id="prerender-content" class="prerender-content">
      ${renderBreadcrumbsHtml(route.breadcrumbs)}
      <article>
        <h1>${esc(route.h1 || route.title)}</h1>
        ${route.intro ? `<p class="prerender-intro">${esc(route.intro)}</p>` : ''}
        ${renderSectionsHtml(route.sections)}
        ${renderFaqHtml(route.faq)}
        ${renderRelatedLinksHtml(route.relatedLinks)}
      </article>
    </main>`

  let html = template
    .replace(/<html([^>]*)>/i, '<html$1 data-updro-prerender="true">')
    .replace(/<title>.*?<\/title>/is, `<title>${esc(route.title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="description" content="${esc(route.description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i, `<link rel="canonical" href="${esc(canonical)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${esc(canonical)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${esc(route.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:description" content="${esc(route.description)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:image" content="${esc(route.ogImage || DEFAULT_OG)}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:title" content="${esc(route.title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:description" content="${esc(route.description)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:image" content="${esc(route.ogImage || DEFAULT_OG)}" />`)

  html = html.replace('</head>', `  ${jsonLd}\n</head>`)
  html = html.replace(/<div\s+id="root"\s*>[\s\S]*?<\/div>/i, `<div id="root">${bodyShell}</div>`)

  return html
}

export const prerenderAll = (outDir: string) => {
  const templatePath = path.join(outDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing build template: ${templatePath}`)
  }

  const template = fs.readFileSync(templatePath, 'utf8')
  const routes = buildRoutes()
  const failures: string[] = []
  let total = 0

  for (const route of routes) {
    try {
      const routeHtml = buildRouteHtml(template, route)
      const routeDir = route.path === '/' ? outDir : path.join(outDir, route.path.replace(/^\//, ''))
      fs.mkdirSync(routeDir, { recursive: true })
      fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml)
      total += 1
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return {
    total,
    failures,
    sampleFailures: failures.slice(0, 10),
  }
}
