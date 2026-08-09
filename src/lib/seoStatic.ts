import { SEO_PAGES } from './seoData'
import { CITIES, SERVICE_CATEGORIES } from './seoCities'
import { COMPARISON_PAGES } from './seoComparisons'
import { ARTICLES } from './seoArticles'
import { TOOLS } from './seoTools'
import { PRICE_GUIDES } from './priceGuideData'
import { CITY_CATEGORY_DEEP } from './seoCityCategoryContent'
import { CITY_DEEP } from './seoCityContent'
import { HOME_TITLE, HOME_DESCRIPTION, HOME_H1, HOME_FAQ } from './homeSeo'

export const SITE_URL = 'https://updro.se'
export type SitemapSection = 'main' | 'cities' | 'articles' | 'tools' | 'comparisons'
export const SITEMAP_SECTIONS: SitemapSection[] = ['main', 'cities', 'articles', 'tools', 'comparisons']

export interface StaticSeoRoute {
  path: string
  title: string
  description: string
  h1: string
  priority: number
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  lastmod?: string
  noindex?: boolean
  links?: { label: string; href: string }[]
  faq?: { q: string; a: string }[]
}

const today = () => new Date().toISOString().split('T')[0]
const abs = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`
const clean = (value = '') => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const trunc = (value: string, max = 155) => clean(value).length <= max ? clean(value) : `${clean(value).slice(0, max - 1).trim()}…`
const words = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
const esc = (value = '') => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const shouldIndexCityService = (citySlug: string, serviceSlug: string) => {
  const city = CITIES.find(cityItem => cityItem.slug === citySlug)
  const service = SERVICE_CATEGORIES.find(serviceItem => serviceItem.slug === serviceSlug)
  if (!city || !service) return false
  return Boolean(CITY_CATEGORY_DEEP[`${citySlug}/${serviceSlug}`])
}

const baseRoutes = (): StaticSeoRoute[] => [
  {
    path: '/',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    h1: HOME_H1,
    priority: 1,
    changefreq: 'daily',
    lastmod: today(),
    links: [
      { label: 'Beskriv ditt projekt', href: '/publicera' },
      { label: 'Hitta byråer', href: '/byraer' },
      { label: 'Artiklar och guider', href: '/artiklar' },
      { label: 'Webbutveckling', href: '/webbutveckling' },
      { label: 'E-handel', href: '/ehandel' },
      { label: 'SEO', href: '/seo' },
      { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
    ],
    faq: HOME_FAQ,
  },
  { path: '/publicera', title: 'Publicera uppdrag – få offerter från digitala byråer | Updro', description: 'Beskriv ditt digitala projekt gratis. Briefen granskas och högst tre relevanta byråer kan lämna offert.', h1: 'Beskriv ditt uppdrag och jämför offerter', priority: 0.9, changefreq: 'weekly', lastmod: today() },
  { path: '/byraer', title: 'Hitta digitala byråer i Sverige | Updro', description: 'Jämför webbyråer, SEO-byråer, e-handelsbyråer och digitala specialister i Sverige.', h1: 'Hitta rätt digital byrå', priority: 0.9, changefreq: 'weekly', lastmod: today() },
  { path: '/priser', title: 'Priser för byråer – pay per lead eller månadskort | Updro', description: 'Se Updros transparenta priser för byråer och prisnivåer för digitala tjänster innan du jämför offerter.', h1: 'Priser för byråer och digitala tjänster', priority: 0.8, changefreq: 'weekly', lastmod: today() },
  { path: '/om-oss', title: 'Om Updro – marknadsplatsen för digitala uppdrag', description: 'Updro hjälper företag att hitta rätt digital byrå genom granskade briefar, högst tre offerter och tydligare beslutsunderlag.', h1: 'Om Updro', priority: 0.6, changefreq: 'monthly', lastmod: today() },
  { path: '/artiklar', title: 'Artiklar och guider om digitala projekt | Updro', description: 'Guider om webb, SEO, e-handel, annonsering och digitala byråval för dig som ska köpa digitala tjänster.', h1: 'Artiklar och guider', priority: 0.8, changefreq: 'weekly', lastmod: today() },
  { path: '/verktyg', title: 'Gratis verktyg för digitala projekt | Updro', description: 'Kalkylatorer, mallar och beslutsstöd som hjälper dig planera och jämföra digitala projekt.', h1: 'Gratis verktyg', priority: 0.8, changefreq: 'weekly', lastmod: today() },
  { path: '/stader', title: 'Hitta digitala byråer per stad | Updro', description: 'Utforska digitala byråer per stad och jämför offerter från lokala och nationella specialister.', h1: 'Digitala byråer per stad', priority: 0.8, changefreq: 'weekly', lastmod: today() },
  { path: '/jamfor', title: 'Jämför byråer och alternativ | Updro', description: 'Jämförelser av byråer, plattformar och alternativ för digitala projekt.', h1: 'Jämför alternativ', priority: 0.8, changefreq: 'weekly', lastmod: today() },
  { path: '/hitta-webbyra', title: 'Hitta webbyrå – jämför upp till tre offerter | Updro', description: 'Hitta rätt webbyrå för hemsida, webbapp eller redesign. Beskriv projektet gratis och jämför upp till tre relevanta offerter.', h1: 'Hitta rätt webbyrå utan massutskick', priority: 0.9, changefreq: 'weekly', lastmod: today() },
  { path: '/hitta-seo-byra', title: 'Hitta SEO-byrå – jämför upp till tre offerter | Updro', description: 'Jämför SEO-byråer inom teknisk SEO, innehåll och lokal synlighet. Beskriv behovet gratis och få upp till tre relevanta offerter.', h1: 'Hitta en SEO-byrå med rätt metod', priority: 0.9, changefreq: 'weekly', lastmod: today() },
  { path: '/hitta-digital-byra', title: 'Hitta digital byrå – jämför upp till tre offerter | Updro', description: 'Hitta digital byrå för webb, annonsering, innehåll eller strategi. Beskriv projektet gratis och jämför upp till tre relevanta offerter.', h1: 'Hitta en digital byrå som passar uppdraget', priority: 0.9, changefreq: 'weekly', lastmod: today() },
  {
    path: '/hjalp-med-hemsida',
    title: 'Hjälp med hemsida – jämför offerter | Updro',
    description: 'Behöver du hjälp med hemsida? Så bestämmer du omfattning, vad det kostar och hur du får offert på hemsida från upp till tre byråer.',
    h1: 'Hjälp med hemsida – så vet du vad du ska beställa',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: today(),
    links: [
      { label: 'Vad kostar en hemsida?', href: '/webbutveckling/pris' },
      { label: 'Webbutveckling', href: '/webbutveckling' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Beskriv ditt projekt', href: '/publicera' },
    ],
    faq: [
      { q: 'Jag vet inte vad jag ska beställa – hur börjar jag?', a: 'Börja med målet i stället för lösningen. Skriv ner vad du vill att en besökare ska göra på sajten och vad som är fel med dagens situation. Byrån föreslår sedan omfattning och teknik.' },
      { q: 'Hur mycket ska ett litet företag räkna med att lägga på en hemsida?', a: 'En enkel företagssida på fem till tio sidor landar oftast mellan 15 000 och 50 000 kronor. Bokning, e-handel eller integrationer höjer nivån.' },
      { q: 'Måste jag ha budget klar innan jag begär offert?', a: 'Nej, men ett spann hjälper. Utan riktning gissar byråerna olika på omfattning och offerterna blir svåra att jämföra.' },
      { q: 'Vad kostar det att driva hemsidan efter lansering?', a: 'Domän och webbhotell kostar från några hundra kronor per år. Ett förvaltningsavtal med uppdateringar, säkerhet och backup ligger vanligen på 500–3 000 kronor per månad.' },
      { q: 'Äger jag hemsidan när den är klar?', a: 'Det ska stå i avtalet. Be om att domän, hostingkonto, källkod, designfiler och analyskonton står i ditt företags namn.' },
    ],
  },
  { path: '/redaktionell-policy', title: 'Redaktionell policy | Updro', description: 'Så arbetar Updro med granskning, kvalitet och transparens i guider och jämförelser.', h1: 'Redaktionell policy', priority: 0.4, changefreq: 'monthly', lastmod: today() },
  { path: '/metod', title: 'Metod för jämförelser och guider | Updro', description: 'Läs hur Updro tar fram guider, jämförelser och rekommendationer för digitala projekt.', h1: 'Metod', priority: 0.4, changefreq: 'monthly', lastmod: today() },
  { path: '/integritetspolicy', title: 'Integritetspolicy | Updro', description: 'Så hanterar Updro personuppgifter, cookies och dataskydd.', h1: 'Integritetspolicy', priority: 0.3, changefreq: 'yearly' },
  { path: '/villkor', title: 'Villkor | Updro', description: 'Villkor för att använda Updros marknadsplats och offerttjänst.', h1: 'Villkor', priority: 0.3, changefreq: 'yearly' },
  { path: '/cookies', title: 'Cookiepolicy | Updro', description: 'Information om hur Updro använder cookies och liknande tekniker.', h1: 'Cookiepolicy', priority: 0.3, changefreq: 'yearly' },
  { path: '/partna-alternativ', title: 'Alternativ till Partna – jämför Updro och Partna', description: 'Jämför Updro och Partna för digitala uppdrag: antal byråer per uppdrag, pay-per-lead, månadskort, verifiering och marknadsläge.', h1: 'Updro eller Partna – vad passar bäst?', priority: 0.9, changefreq: 'weekly', lastmod: today(), links: [{ label: 'Alla jämförelser', href: '/jamfor' }, { label: 'För byråer: byt från Partna', href: '/for-byraer/byt-fran-partna' }] },
  { path: '/swivrr-alternativ', title: 'Alternativ till Swivrr – jämför Updro och Swivrr', description: 'Jämför Updro och Swivrr för digitala uppdrag: antal offerter, byråpriser, AI-brief, prisuppskattning, prisguider och byråprofiler.', h1: 'Updro eller Swivrr – vad passar bäst?', priority: 0.8, changefreq: 'monthly', lastmod: today(), links: [{ label: 'Alla jämförelser', href: '/jamfor' }] },
  { path: '/for-byraer/byt-fran-partna', title: 'Testa Updro som alternativ till Partna – för digitala byråer', description: 'Jämför pris, konkurrens per uppdrag och produktflöde. Börja med fem kostnadsfria lead-krediter och mät faktisk kostnad per vunnen affär.', h1: 'Testa Updro parallellt – byt först när siffrorna säger det', priority: 0.8, changefreq: 'monthly', lastmod: today(), links: [{ label: 'Saklig jämförelse Updro och Partna', href: '/partna-alternativ' }] },
  { path: '/support', title: 'Support | Updro', description: 'Kontakta Updros support för hjälp med uppdrag, offerter, konto eller fakturering.', h1: 'Support', priority: 0.4, changefreq: 'monthly', lastmod: today() },
  { path: '/rapportera-innehall', title: 'Rapportera innehåll | Updro', description: 'Anmäl misstänkt olagligt innehåll eller överklaga ett modereringsbeslut.', h1: 'Rapportera innehåll eller överklaga beslut', priority: 0.3, changefreq: 'yearly' },
  { path: '/integritet/prospektering', title: 'Integritetsinformation för prospektering | Updro', description: 'GDPR-information om Updros begränsade research av offentliga företagswebbplatser.', h1: 'Integritetsinformation för företagsprospektering', priority: 0.3, changefreq: 'yearly' },
]

const CATEGORY_AGENCY_LABEL: Record<string, string> = {
  'webbutveckling': 'Webbutvecklingsbyråer',
  'seo': 'SEO-byråer',
  'ehandel': 'E-handelsbyråer',
  'digital-marknadsforing': 'Digitala marknadsföringsbyråer',
  'apputveckling': 'Apputvecklingsbyråer',
  'grafisk-design': 'Designbyråer',
  'google-ads': 'Google Ads-byråer',
  'e-postmarknadsforing': 'Byråer för e-postmarknadsföring',
  'analys-data': 'Analys- och databyråer',
  'ux-ui-design': 'UX- och UI-byråer',
}

const categoryAgencyLabel = (slug: string, name: string): string =>
  CATEGORY_AGENCY_LABEL[slug] ?? `${name}-byråer`

const categoryRoutes = (): StaticSeoRoute[] => SERVICE_CATEGORIES.map(category => ({
  path: `/byraer/kategori/${category.slug}`,
  title: `${categoryAgencyLabel(category.slug, category.name)} i Sverige | Updro`,
  description: trunc(`${category.description} Beskriv projektet gratis och jämför högst tre relevanta offerter.`),
  h1: `${categoryAgencyLabel(category.slug, category.name)} i Sverige`,
  priority: 0.7,
  changefreq: 'weekly' as const,
  lastmod: today(),
  links: [
    { label: 'Alla byråer', href: '/byraer' },
    ...SERVICE_CATEGORIES.filter(other => other.slug !== category.slug).slice(0, 6).map(other => ({ label: `${other.name}-byråer`, href: `/byraer/kategori/${other.slug}` })),
  ],
}))

const serviceRoutes = (): StaticSeoRoute[] => SEO_PAGES.flatMap((page: any) => [
  { path: `/${page.categorySlug}`, title: page.metaTitle, description: trunc(page.metaDesc || page.intro), h1: page.h1 || page.categoryName, priority: 0.9, changefreq: 'weekly', lastmod: today(), links: (page.subPages || []).slice(0, 8).map((subPage: any) => ({ label: subPage.h1 || subPage.title, href: `/${page.categorySlug}/${subPage.slug}` })), faq: (page.faq || []).slice(0, 5) },
  ...(page.subPages || []).map((subPage: any) => ({ path: `/${page.categorySlug}/${subPage.slug}`, title: subPage.title || `${page.categoryName} ${words(subPage.slug)} | Updro`, description: trunc(subPage.metaDesc || subPage.intro), h1: subPage.h1 || `${page.categoryName} ${words(subPage.slug)}`, priority: 0.7, changefreq: 'monthly' as const, lastmod: today(), links: [{ label: page.categoryName, href: `/${page.categorySlug}` }, ...((subPage.relatedLinks || []).slice(0, 6))], faq: (subPage.faq || []).slice(0, 5) })),
])

const cityRoutes = (): StaticSeoRoute[] => CITIES.flatMap((city: any) => {
  const serviceLinks = SERVICE_CATEGORIES.map((service: any) => ({ label: `${service.shortName || service.name} i ${city.name}`, href: `/byraer/${city.slug}/${service.slug}` }))
  const cityDeep = CITY_DEEP[city.slug]
  return [
    { path: `/byraer/${city.slug}`, title: `Digitala byråer i ${city.name} – jämför offerter | Updro`, description: trunc(cityDeep?.intro || `Hitta digitala byråer i ${city.name}. ${city.techDescription} Beskriv projektet gratis och jämför högst tre relevanta offerter.`), h1: `Digitala byråer i ${city.name}`, priority: 0.8, changefreq: 'weekly' as const, lastmod: today(), links: serviceLinks, faq: cityDeep?.faq?.slice(0, 5) },
    ...SERVICE_CATEGORIES.map((service: any) => {
      const deep = CITY_CATEGORY_DEEP[`${city.slug}/${service.slug}`]
      const noindex = !shouldIndexCityService(city.slug, service.slug)
      const relatedServices = SERVICE_CATEGORIES.filter((item: any) => item.slug !== service.slug).slice(0, 5).map((item: any) => ({ label: `${item.name} i ${city.name}`, href: `/byraer/${city.slug}/${item.slug}` }))
      const relatedCities = CITIES.filter((item: any) => item.slug !== city.slug).slice(0, 5).map((item: any) => ({ label: `${service.name} i ${item.name}`, href: `/byraer/${item.slug}/${service.slug}` }))
      return {
        path: `/byraer/${city.slug}/${service.slug}`,
        title: deep?.title || `${service.name}-byrå i ${city.name} – jämför offerter | Updro`,
        description: trunc(deep?.metaDesc || `Hitta ${service.name.toLowerCase()}-byrå i ${city.name}. ${service.description} Lokal kontext: ${city.techDescription}`),
        h1: deep?.h1 || `${service.name}-byrå i ${city.name}`,
        priority: noindex ? 0.2 : 0.7,
        changefreq: 'monthly' as const,
        lastmod: today(),
        noindex,
        links: [...relatedServices, ...relatedCities],
        // Endast unikt FAQ-innehåll – generiska mallsvar ger dubblettschema
        faq: deep?.faq?.slice(0, 5),
      }
    }),
  ]
})

const contentRoutes = (): StaticSeoRoute[] => [
  ...COMPARISON_PAGES.map((page: any) => ({ path: `/${page.slug}`, title: page.metaTitle || page.title || `${words(page.slug)} | Updro`, description: trunc(page.metaDesc || page.description || `Jämför ${words(page.slug)}.`), h1: page.h1 || page.title || words(page.slug), priority: 0.8, changefreq: 'monthly' as const, lastmod: today(), links: [{ label: 'Alla jämförelser', href: '/jamfor' }] })),
  ...ARTICLES.map((article: any) => ({ path: `/artiklar/${article.slug}`, title: article.metaTitle || article.title || `${words(article.slug)} | Updro`, description: trunc(article.metaDesc || article.excerpt || article.description || `Läs Updros guide om ${words(article.slug)}.`), h1: article.title || words(article.slug), priority: 0.7, changefreq: 'monthly' as const, lastmod: article.updatedDate || article.publishedDate || today(), links: [{ label: 'Alla artiklar', href: '/artiklar' }] })),
  ...TOOLS.map((tool: any) => ({ path: `/verktyg/${tool.slug}`, title: tool.metaTitle || tool.title || `${words(tool.slug)} | Updro`, description: trunc(tool.metaDesc || tool.description || `Använd Updros kostnadsfria verktyg för ${words(tool.slug)}.`), h1: tool.h1 || tool.title || words(tool.slug), priority: 0.7, changefreq: 'monthly' as const, lastmod: today(), links: [{ label: 'Alla verktyg', href: '/verktyg' }] })),
  ...PRICE_GUIDES.map(guide => ({ path: `/priser/${guide.slug}`, title: guide.title, description: trunc(guide.metaDescription), h1: guide.h1, priority: 0.8, changefreq: 'monthly' as const, lastmod: today(), links: [{ label: 'Alla prisguider', href: '/priser' }, ...PRICE_GUIDES.filter(other => other.slug !== guide.slug).map(other => ({ label: other.h1, href: `/priser/${other.slug}` }))], faq: guide.faq.slice(0, 5) })),
]

export const getAllStaticSeoRoutes = () => {
  const map = new Map<string, StaticSeoRoute>()
  for (const route of [...baseRoutes(), ...serviceRoutes(), ...cityRoutes(), ...categoryRoutes(), ...contentRoutes()]) map.set(route.path, route)
  return [...map.values()]
}

export const getIndexableSeoRoutes = () => getAllStaticSeoRoutes().filter(route => !route.noindex)
export const getNoindexSeoRoutes = () => getAllStaticSeoRoutes().filter(route => route.noindex)

const section = (path: string): SitemapSection => {
  if (path.startsWith('/artiklar/')) return 'articles'
  if (path.startsWith('/verktyg/')) return 'tools'
  if (path.startsWith('/byraer/') || path.startsWith('/stader/')) return 'cities'
  if (path === '/jamfor' || path.includes('jamfor') || path.startsWith('/basta-') || path.includes('alternativ') || path.includes('partna') || path.includes('swivrr')) return 'comparisons'
  return 'main'
}

const urlset = (routes: StaticSeoRoute[]) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${abs(route.path)}</loc><lastmod>${route.lastmod || today()}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority.toFixed(1)}</priority></url>`).join('\n')}\n</urlset>`
export const generateSitemapXml = () => urlset(getIndexableSeoRoutes())
export const generateSectionSitemapXml = (sitemapSection: SitemapSection) => {
  const routes = getIndexableSeoRoutes().filter(route => section(route.path) === sitemapSection)
  return routes.length ? urlset(routes) : null
}
export const generateSitemapIndexXml = () => `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SITEMAP_SECTIONS.filter(sitemapSection => getIndexableSeoRoutes().some(route => section(route.path) === sitemapSection)).map(sitemapSection => `  <sitemap><loc>${SITE_URL}/sitemap-${sitemapSection}.xml</loc><lastmod>${today()}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>`

const jsonLd = (route: StaticSeoRoute) => JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Updro', legalName: 'Aurora Media AB', url: SITE_URL }, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Updro', publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: 'sv-SE' }, { '@type': 'WebPage', '@id': `${abs(route.path)}#webpage`, url: abs(route.path), name: route.title, headline: route.h1, description: route.description, inLanguage: 'sv-SE' }, ...(route.faq?.length ? [{ '@type': 'FAQPage', mainEntity: route.faq.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) }] : [])] }).replace(/</g, '\\u003c')

const head = (route: StaticSeoRoute) => [`<title>${esc(route.title)}</title>`, `<meta name="description" content="${esc(route.description)}" />`, `<meta name="robots" content="${route.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`, `<link rel="canonical" href="${abs(route.path)}" />`, `<meta property="og:type" content="website" />`, `<meta property="og:url" content="${abs(route.path)}" />`, `<meta property="og:title" content="${esc(route.title)}" />`, `<meta property="og:description" content="${esc(route.description)}" />`, `<meta property="og:image" content="${SITE_URL}/og/og-default.png" />`, `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${esc(route.title)}" />`, `<meta name="twitter:description" content="${esc(route.description)}" />`, `<script type="application/ld+json">${jsonLd(route)}</script>`].join('\n    ')

const body = (route: StaticSeoRoute) => `<main id="static-seo-content" data-static-route="${esc(route.path)}"><nav><a href="/">Hem</a></nav><h1>${esc(route.h1)}</h1><p>${esc(route.description)}</p>${route.links?.length ? `<section><h2>Relaterade sidor</h2><ul>${route.links.map(link => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('')}</ul></section>` : ''}${route.faq?.length ? `<section><h2>Vanliga frågor</h2>${route.faq.map(faq => `<article><h3>${esc(faq.q)}</h3><p>${esc(faq.a)}</p></article>`).join('')}</section>` : ''}</main>`

export const renderStaticHtml = (template: string, route: StaticSeoRoute) => {
  let html = template
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\s*\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="description"[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="robots"[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<meta\s+property="og:[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="twitter:[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n?/gi, '')
  html = html.replace('</head>', `    ${head(route)}\n  </head>`)
  return html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${body(route)}</div>`)
}
