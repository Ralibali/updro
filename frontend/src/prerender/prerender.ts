/**
 * Build-time static HTML prerendering for SEO.
 *
 * Why: The app is an SPA. Without prerendering, every URL serves the same
 * index.html with identical <title>, <meta description> and empty body. Google
 * and AI crawlers get weak, duplicate signals across all SEO landing pages.
 *
 * What this does: for every known SEO route we read the built dist/index.html
 * as template and emit a per-route dist/{route}/index.html with:
 *   - route-specific <title>, <meta description>, <link canonical>
 *   - OG / Twitter meta per route
 *   - JSON-LD (BreadcrumbList, Article / FAQPage / Service / WebPage)
 *   - A semantic body shell (H1, intro, section headings, FAQ, internal links)
 *     that crawlers can index immediately without executing JavaScript
 *
 * The body shell is replaced when React mounts (createRoot.render clears
 * children), so end users see the full SPA. Only crawlers / first-paint
 * benefit from the extra HTML.
 *
 * Works on any static host (Lovable, Netlify, Vercel, Cloudflare Pages).
 * No Chrome / Puppeteer needed.
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

const pickOg = (slug: string): string => {
  if (!slug) return DEFAULT_OG
  if (OG_BY_CATEGORY[slug]) return OG_BY_CATEGORY[slug]
  for (const key of Object.keys(OG_BY_CATEGORY)) {
    if (slug.includes(key)) return OG_BY_CATEGORY[key]
  }
  return DEFAULT_OG
}

const esc = (s: string): string =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Truncate meta description to 160 chars at a word boundary */
const clampDesc = (s: string): string => {
  const clean = s.replace(/\s+/g, ' ').trim()
  if (clean.length <= 160) return clean
  const cut = clean.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '…'
}

/** Convert lightweight markdown-ish content into safe HTML for the prerender body */
const markdownToHtml = (md: string): string => {
  // Strip markdown tables / pipes for prerender simplicity – SPA shows real rendering.
  const lines = md.split('\n').map(l => l.trim())
  const out: string[] = []
  let inList = false
  for (const line of lines) {
    if (!line) {
      if (inList) { out.push('</ul>'); inList = false }
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push('<ul>'); inList = true }
      const item = line.replace(/^[-*]\s+/, '')
      out.push(`<li>${inlineFmt(item)}</li>`)
    } else if (/^\|.*\|$/.test(line)) {
      // Skip markdown tables in prerender
      continue
    } else {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p>${inlineFmt(line)}</p>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

const inlineFmt = (s: string): string => {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
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
  articleType?: string
  schemaType?: 'WebPage' | 'Article' | 'Service' | 'CollectionPage' | 'FAQPage' | 'AboutPage'
}

const crumb = (...items: { name: string; url: string }[]) => items
const absUrl = (p: string) => `${SITE_URL}${p}`

/**
 * Build the full list of prerenderable routes.
 * Excludes: auth, dashboard, admin, ephemeral wizard.
 */
const buildRoutes = (): RouteMeta[] => {
  const routes: RouteMeta[] = []

  // ─── Static / top-level marketplace pages ────────────────────────────────
  const home: RouteMeta = {
    path: '/',
    title: 'Updro – Jämför offerter från webbyrå, SEO-byrå & UX-byrå i Sverige',
    description:
      'Beskriv ditt projekt gratis och få upp till 5 offerter från kvalitetssäkrade digitala byråer inom 24 h. Webbutveckling, SEO, UX/UI, e-handel, Google Ads & apputveckling i hela Sverige.',
    h1: 'Hitta rätt byrå för ditt digitala projekt',
    intro:
      'Updro är Sveriges marknadsplats för digitala uppdrag. Publicera ditt projekt gratis och få skräddarsydda offerter från kvalitetssäkrade webbyråer, SEO-byråer, UX-byråer, e-handelsbyråer och digitala marknadsföringsbyråer inom 24 timmar.',
    breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }),
    ogImage: DEFAULT_OG,
    schemaType: 'WebPage',
    relatedLinks: [
      { label: 'Publicera uppdrag', href: '/publicera' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Hitta SEO-byrå', href: '/hitta-seo-byra' },
      { label: 'Jämför byråer', href: '/jamfor' },
      { label: 'Priser', href: '/priser' },
      { label: 'Artiklar', href: '/artiklar' },
    ],
  }
  routes.push(home)

  const staticPages: RouteMeta[] = [
    {
      path: '/publicera',
      title: 'Publicera uppdrag gratis – få offerter inom 24 h | Updro',
      description: 'Publicera ditt digitala uppdrag gratis på Updro och få upp till 5 offerter från kvalitetssäkrade byråer inom 24 timmar. Helt utan förpliktelser.',
      h1: 'Publicera ditt uppdrag – kostnadsfritt',
      intro: 'Beskriv kort vad du vill ha byggt. Vi matchar ditt projekt med kvalitetssäkrade byråer som svarar med offerter inom 24 timmar.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Publicera', url: absUrl('/publicera') }),
      schemaType: 'WebPage',
    },
    {
      path: '/byraer',
      title: 'Hitta digitala byråer i Sverige | Updro',
      description: 'Bläddra bland Sveriges kvalitetssäkrade digitala byråer. Filtrera på stad, specialitet och prisnivå – hitta rätt partner för ditt projekt.',
      h1: 'Alla digitala byråer i Sverige',
      intro: 'Utforska vårt nätverk av kvalitetssäkrade byråer inom webb, SEO, UX/UI, e-handel, Google Ads och digital marknadsföring.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Byråer', url: absUrl('/byraer') }),
      schemaType: 'CollectionPage',
    },
    {
      path: '/priser',
      title: 'Priser – Så mycket kostar Updro för byråer | Updro',
      description: 'Transparenta priser för byråer på Updro. Inga fasta månadskostnader – du betalar endast för uppdrag du vill lämna offert på.',
      h1: 'Priser för byråer',
      intro: 'Hos oss betalar du bara när du vill lämna offert. Inga dolda kostnader, inga bindningstider.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Priser', url: absUrl('/priser') }),
      schemaType: 'WebPage',
    },
    {
      path: '/om-oss',
      title: 'Om Updro – Sveriges marknadsplats för digitala uppdrag',
      description: 'Updro drivs av Aurora Media AB och är Sveriges marknadsplats för digitala uppdrag. Vi kvalitetssäkrar alla anslutna byråer.',
      h1: 'Om Updro',
      intro: 'Updro är en svensk marknadsplats där företag publicerar digitala uppdrag och får upp till fem offerter från kvalitetssäkrade byråer inom 24 timmar.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Om oss', url: absUrl('/om-oss') }),
      schemaType: 'AboutPage',
    },
    {
      path: '/artiklar',
      title: 'Artiklar & guider om digitala projekt | Updro',
      description: 'Praktiska guider om webb, SEO, UX, e-handel och digital marknadsföring – skrivna för dig som ska beställa ett digitalt projekt.',
      h1: 'Artiklar & guider',
      intro: 'Fördjupande artiklar som hjälper dig att kravställa, prissätta och genomföra ditt nästa digitala projekt.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Artiklar', url: absUrl('/artiklar') }),
      schemaType: 'CollectionPage',
      ogImage: OG_BY_CATEGORY['artiklar'],
    },
    {
      path: '/verktyg',
      title: 'Gratis verktyg för digitala projekt | Updro',
      description: 'Gratis kalkylatorer och verktyg som hjälper dig planera, prissätta och kravställa ditt nästa digitala projekt.',
      h1: 'Gratis verktyg',
      intro: 'Kalkylatorer och mallar du kan använda direkt – utan registrering.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Verktyg', url: absUrl('/verktyg') }),
      schemaType: 'CollectionPage',
    },
    {
      path: '/stader',
      title: 'Digitala byråer per stad i Sverige | Updro',
      description: 'Hitta lokala digitala byråer i din stad. Översikt över utbud, specialiteter och prisnivå i 25 svenska städer.',
      h1: 'Byråer per stad',
      intro: 'Välj din stad nedan för att se lokala byråer och få en bild av marknadspriser där du verkar.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Städer', url: absUrl('/stader') }),
      schemaType: 'CollectionPage',
    },
    {
      path: '/jamfor',
      title: 'Jämför bästa byråerna i Sverige 2026 | Updro',
      description: 'Oberoende jämförelser av Sveriges bästa byråer inom webb, SEO, UX, e-handel, Google Ads och digital marknadsföring.',
      h1: 'Jämför bästa byråerna 2026',
      intro: 'Oberoende topplistor baserade på resultat, recensioner och specialistkompetens.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Jämför', url: absUrl('/jamfor') }),
      schemaType: 'CollectionPage',
      ogImage: OG_BY_CATEGORY['jamfor'],
    },
    {
      path: '/hitta-webbyra',
      title: 'Hitta webbyrå – jämför 500+ byråer i Sverige | Updro',
      description: 'Hitta rätt webbyrå för ditt projekt. Jämför 500+ kvalitetssäkrade webbyråer i Sverige och få offerter gratis inom 24 timmar.',
      h1: 'Hitta rätt webbyrå i Sverige',
      intro: 'Vi matchar ditt webbprojekt med kvalitetssäkrade webbyråer i hela Sverige. Publicera ditt uppdrag gratis och få 3–5 skräddarsydda offerter inom ett dygn.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Hitta webbyrå', url: absUrl('/hitta-webbyra') }),
      schemaType: 'Service',
      ogImage: OG_BY_CATEGORY['webbutveckling'],
      relatedLinks: [
        { label: 'Webbutveckling pris', href: '/webbutveckling/pris' },
        { label: 'Webbyrå Stockholm', href: '/webbyra-stockholm' },
        { label: 'Webbyrå Göteborg', href: '/webbyra-goteborg' },
        { label: 'Bästa webbyrån', href: '/basta-webbyran' },
      ],
    },
    {
      path: '/hitta-seo-byra',
      title: 'Hitta SEO-byrå – jämför offerter i Sverige | Updro',
      description: 'Hitta rätt SEO-byrå för ditt företag. Jämför kvalitetssäkrade SEO-byråer i Sverige och få offerter gratis inom 24 timmar.',
      h1: 'Hitta rätt SEO-byrå i Sverige',
      intro: 'Vi matchar ditt SEO-uppdrag med specialiserade byråer i hela Sverige. Få 3–5 offerter gratis inom 24 timmar.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Hitta SEO-byrå', url: absUrl('/hitta-seo-byra') }),
      schemaType: 'Service',
      ogImage: OG_BY_CATEGORY['seo'],
      relatedLinks: [
        { label: 'SEO pris', href: '/seo/pris' },
        { label: 'SEO-byrå Stockholm', href: '/seo-byra-stockholm' },
        { label: 'SEO-byrå Göteborg', href: '/seo-byra-goteborg' },
        { label: 'Bästa SEO-byrån', href: '/basta-seo-byran' },
      ],
    },
    {
      path: '/hitta-digital-byra',
      title: 'Hitta digital byrå – jämför i hela Sverige | Updro',
      description: 'Hitta rätt digital byrå för ditt projekt – webb, SEO, UX, e-handel, Google Ads eller digital marknadsföring. Gratis offertjämförelse.',
      h1: 'Hitta rätt digital byrå',
      intro: 'Oavsett om du behöver en webbyrå, SEO-partner, UX-team eller hela den digitala kedjan – vi matchar dig med rätt byrå för uppdraget.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Hitta digital byrå', url: absUrl('/hitta-digital-byra') }),
      schemaType: 'Service',
      ogImage: OG_BY_CATEGORY['digital-marknadsforing'],
    },
    {
      path: '/redaktionell-policy',
      title: 'Redaktionell policy | Updro',
      description: 'Så arbetar vi redaktionellt på Updro – oberoende, faktakontroll och tydlig åtskillnad mellan annonsering och redaktionellt innehåll.',
      h1: 'Redaktionell policy',
      intro: 'Vår redaktionella policy beskriver hur vi tar fram och uppdaterar innehåll på Updro.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Redaktionell policy', url: absUrl('/redaktionell-policy') }),
      schemaType: 'WebPage',
    },
    {
      path: '/metod',
      title: 'Så fungerar Updro – vår metod | Updro',
      description: 'Så kvalitetssäkrar vi byråer på Updro och hur vi matchar ditt uppdrag med rätt leverantör.',
      h1: 'Vår metod',
      intro: 'Så arbetar vi med kvalitetssäkring, matchning och uppföljning av uppdrag.',
      breadcrumbs: crumb({ name: 'Hem', url: absUrl('/') }, { name: 'Metod', url: absUrl('/metod') }),
      schemaType: 'WebPage',
    },
  ]
  routes.push(...staticPages)

  // ─── Pillar pages & sub-pages (/webbutveckling, /seo, /seo/pris ...) ─────
  for (const pillar of SEO_PAGES) {
    routes.push({
      path: `/${pillar.categorySlug}`,
      title: pillar.metaTitle,
      description: pillar.metaDesc,
      h1: pillar.h1,
      intro: pillar.intro,
      sections: pillar.sections,
      faq: pillar.faq,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: pillar.categoryName, url: absUrl(`/${pillar.categorySlug}`) },
      ),
      schemaType: 'Service',
      ogImage: pickOg(pillar.categorySlug),
      relatedLinks: pillar.subPages.slice(0, 6).map(sp => ({
        label: sp.title,
        href: `/${pillar.categorySlug}/${sp.slug}`,
      })),
    })

    for (const sub of pillar.subPages) {
      routes.push({
        path: `/${pillar.categorySlug}/${sub.slug}`,
        title: sub.title,
        description: sub.metaDesc,
        h1: sub.h1,
        intro: sub.intro,
        sections: sub.sections,
        faq: sub.faq,
        relatedLinks: sub.relatedLinks,
        breadcrumbs: crumb(
          { name: 'Hem', url: absUrl('/') },
          { name: pillar.categoryName, url: absUrl(`/${pillar.categorySlug}`) },
          { name: sub.h1, url: absUrl(`/${pillar.categorySlug}/${sub.slug}`) },
        ),
        schemaType: 'Service',
        ogImage: pickOg(pillar.categorySlug),
      })
    }
  }

  // ─── Comparison pages (/basta-*-byran) ───────────────────────────────────
  for (const comp of COMPARISON_PAGES) {
    routes.push({
      path: `/${comp.slug}`,
      title: comp.metaTitle,
      description: comp.metaDesc,
      h1: comp.h1,
      intro: comp.intro,
      sections: comp.sections,
      faq: comp.faq,
      relatedLinks: comp.relatedLinks,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: 'Jämför', url: absUrl('/jamfor') },
        { name: comp.h1, url: absUrl(`/${comp.slug}`) },
      ),
      schemaType: 'Article',
      ogImage: pickOg(comp.slug),
    })
  }

  // ─── Cities × categories (/byraer/stockholm, /byraer/stockholm/webb...) ──
  for (const city of CITIES) {
    routes.push({
      path: `/stader/${city.slug}`,
      title: `Digitala byråer i ${city.name} – topp-lista 2026 | Updro`,
      description: `Hitta de bästa digitala byråerna i ${city.name}. ${city.techDescription} Jämför offerter gratis på Updro.`,
      h1: `Digitala byråer i ${city.name}`,
      intro: `${city.description} ${city.techDescription}`,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: 'Städer', url: absUrl('/stader') },
        { name: city.name, url: absUrl(`/stader/${city.slug}`) },
      ),
      schemaType: 'CollectionPage',
      relatedLinks: SERVICE_CATEGORIES.slice(0, 8).map(c => ({
        label: `${c.shortName} ${city.name}`,
        href: `/byraer/${city.slug}/${c.slug}`,
      })),
    })

    routes.push({
      path: `/byraer/${city.slug}`,
      title: `Byråer i ${city.name} – jämför & få offerter | Updro`,
      description: `Jämför digitala byråer i ${city.name}. Webb, SEO, UX, e-handel och marknadsföring. Få upp till 5 offerter gratis inom 24 h.`,
      h1: `Digitala byråer i ${city.name}`,
      intro: `Hitta och jämför ${city.name}s bästa digitala byråer inom alla specialområden – från webb och SEO till UX och e-handel.`,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: 'Byråer', url: absUrl('/byraer') },
        { name: city.name, url: absUrl(`/byraer/${city.slug}`) },
      ),
      schemaType: 'CollectionPage',
      relatedLinks: SERVICE_CATEGORIES.slice(0, 8).map(c => ({
        label: `${c.name} i ${city.name}`,
        href: `/byraer/${city.slug}/${c.slug}`,
      })),
    })

    for (const cat of SERVICE_CATEGORIES) {
      routes.push({
        path: `/byraer/${city.slug}/${cat.slug}`,
        title: `${cat.name} – ${cat.shortName} i ${city.name} | Updro`,
        description: `Hitta ${cat.shortName.toLowerCase()} i ${city.name}. ${cat.description.split('. ').slice(0, 2).join('. ')}.`,
        h1: `${cat.name} i ${city.name}`,
        intro: cat.description,
        breadcrumbs: crumb(
          { name: 'Hem', url: absUrl('/') },
          { name: 'Byråer', url: absUrl('/byraer') },
          { name: city.name, url: absUrl(`/byraer/${city.slug}`) },
          { name: cat.name, url: absUrl(`/byraer/${city.slug}/${cat.slug}`) },
        ),
        schemaType: 'Service',
        ogImage: pickOg(cat.slug),
        relatedLinks: [
          { label: `${cat.name} i hela Sverige`, href: `/${cat.slug}` },
          { label: `Alla byråer i ${city.name}`, href: `/byraer/${city.slug}` },
          { label: `Jämför bästa ${cat.shortName.toLowerCase()}`, href: '/jamfor' },
        ],
      })
    }
  }

  // ─── Articles (/artiklar/:slug) ──────────────────────────────────────────
  for (const a of ARTICLES) {
    routes.push({
      path: `/artiklar/${a.slug}`,
      title: a.metaTitle,
      description: a.metaDesc,
      h1: a.h1,
      intro: a.intro,
      sections: a.sections,
      faq: a.faq,
      relatedLinks: a.relatedLinks,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: 'Artiklar', url: absUrl('/artiklar') },
        { name: a.h1, url: absUrl(`/artiklar/${a.slug}`) },
      ),
      schemaType: 'Article',
      type: 'article',
      publishedDate: a.publishedDate,
      updatedDate: a.updatedDate || a.publishedDate,
      category: a.category,
      articleType: a.type || 'guide',
      ogImage: OG_BY_CATEGORY['artiklar'],
    })
  }

  // ─── Tools (/verktyg/:slug) ──────────────────────────────────────────────
  for (const t of TOOLS) {
    routes.push({
      path: `/verktyg/${t.slug}`,
      title: t.metaTitle,
      description: t.metaDesc,
      h1: t.h1,
      intro: t.intro,
      sections: [{ heading: 'Om verktyget', content: t.description }],
      relatedLinks: t.relatedLinks,
      breadcrumbs: crumb(
        { name: 'Hem', url: absUrl('/') },
        { name: 'Verktyg', url: absUrl('/verktyg') },
        { name: t.h1, url: absUrl(`/verktyg/${t.slug}`) },
      ),
      schemaType: 'WebPage',
    })
  }

  return routes
}

// ─── HTML generation ─────────────────────────────────────────────────────────

const renderBreadcrumbsHtml = (items: { name: string; url: string }[]): string => {
  const nodes = items.map((it, i) => {
    const isLast = i === items.length - 1
    return isLast
      ? `<li aria-current="page"><span>${esc(it.name)}</span></li>`
      : `<li><a href="${esc(it.url)}">${esc(it.name)}</a></li>`
  }).join('')
  return `<nav aria-label="Brödsmulor" class="prerender-breadcrumbs"><ol>${nodes}</ol></nav>`
}

const renderSectionsHtml = (sections?: { heading: string; content: string }[]): string => {
  if (!sections?.length) return ''
  return sections.map(s => (
    `<section class="prerender-section">
      <h2>${esc(s.heading)}</h2>
      ${markdownToHtml(s.content)}
    </section>`
  )).join('\n')
}

const renderFaqHtml = (faq?: { q: string; a: string }[]): string => {
  if (!faq?.length) return ''
  const items = faq.map(f => (
    `<div class="prerender-faq-item">
      <h3>${esc(f.q)}</h3>
      <p>${esc(f.a)}</p>
    </div>`
  )).join('\n')
  return `<section class="prerender-faq"><h2>Vanliga frågor</h2>${items}</section>`
}

const renderRelatedLinksHtml = (links?: { label: string; href: string }[]): string => {
  if (!links?.length) return ''
  const items = links.map(l => (
    `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`
  )).join('')
  return `<nav class="prerender-related" aria-label="Relaterade sidor"><h2>Relaterat</h2><ul>${items}</ul></nav>`
}

const buildJsonLd = (r: RouteMeta): string => {
  const canonical = absUrl(r.path)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: r.breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  }

  const blocks: object[] = [breadcrumb]

  if (r.schemaType === 'Article' || r.type === 'article') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: r.h1 || r.title,
      description: r.description,
      url: canonical,
      inLanguage: 'sv-SE',
      mainEntityOfPage: canonical,
      ...(r.publishedDate ? { datePublished: r.publishedDate } : {}),
      ...(r.updatedDate ? { dateModified: r.updatedDate } : {}),
      ...(r.category ? { articleSection: r.category } : {}),
      image: r.ogImage || DEFAULT_OG,
      author: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Updro' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    })
  } else if (r.schemaType === 'Service') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: r.h1 || r.title,
      description: r.description,
      url: canonical,
      areaServed: { '@type': 'Country', name: 'Sweden' },
      provider: { '@id': `${SITE_URL}/#organization` },
    })
  } else {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': r.schemaType || 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: r.title,
      description: r.description,
      inLanguage: 'sv-SE',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    })
  }

  if (r.faq?.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: r.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }

  return blocks
    .map(b => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join('\n    ')
}

/** Patch the already-built index.html for a specific route */
export const buildRouteHtml = (templateHtml: string, r: RouteMeta): string => {
  const canonical = absUrl(r.path)
  const desc = clampDesc(r.description)
  const ogImage = r.ogImage || DEFAULT_OG
  const ogType = r.type === 'article' ? 'article' : 'website'

  let html = templateHtml

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(r.title)}</title>`)

  // <meta description>
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${esc(desc)}" />`,
  )

  // <link canonical>
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${esc(canonical)}" />`,
  )

  // hreflang (keep sv + x-default pointing to this URL so signals don't leak home)
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']sv["'][^>]*>/i,
    `<link rel="alternate" hreflang="sv" href="${esc(canonical)}" />`,
  )
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']x-default["'][^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${esc(canonical)}" />`,
  )

  // OG tags
  const ogReplacements: [RegExp, string][] = [
    [/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:url" content="${esc(canonical)}" />`],
    [/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:title" content="${esc(r.title)}" />`],
    [/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:description" content="${esc(desc)}" />`],
    [/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:image" content="${esc(ogImage)}" />`],
    [/<meta\s+property=["']og:type["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:type" content="${esc(ogType)}" />`],
    [/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:title" content="${esc(r.title)}" />`],
    [/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:description" content="${esc(desc)}" />`],
    [/<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:image" content="${esc(ogImage)}" />`],
  ]
  for (const [re, replacement] of ogReplacements) {
    html = html.replace(re, replacement)
  }

  // Inject route-specific JSON-LD before </head>
  const jsonLd = buildJsonLd(r)
  html = html.replace('</head>', `    ${jsonLd}\n  </head>`)

  // Inject semantic body shell inside #root (React clears it on mount)
  const bodyShell = `
  <!-- Prerendered SEO shell – replaced by React on client hydration -->
  <div class="prerender-shell">
    ${renderBreadcrumbsHtml(r.breadcrumbs)}
    <main>
      <header>
        <h1>${esc(r.h1 || r.title)}</h1>
        ${r.intro ? `<p class="prerender-intro">${esc(r.intro)}</p>` : ''}
      </header>
      ${renderSectionsHtml(r.sections)}
      ${renderFaqHtml(r.faq)}
      ${renderRelatedLinksHtml(r.relatedLinks)}
    </main>
    <noscript>
      <p>Den här webbplatsen fungerar bäst med JavaScript aktiverat. Utan JavaScript kan du fortfarande läsa det primära innehållet ovan.</p>
    </noscript>
  </div>`

  html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${bodyShell}</div>`)

  return html
}

const PRERENDER_CSS = `
    <style>
      /* Prerender SEO shell – visually hidden until React hydrates. 
         Content remains in DOM (not display:none) so crawlers still read it. */
      .prerender-shell {
        position: absolute;
        left: 0; right: 0; top: 0;
        opacity: 0;
        pointer-events: none;
        z-index: -1;
        max-height: 0;
        overflow: hidden;
      }
    </style>`

/** Main entry: run after vite build writes dist/ */
export const prerenderAll = (outDir: string): { total: number; sampleFailures: string[] } => {
  const templatePath = path.join(outDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Prerender: template not found at ${templatePath}`)
  }
  let template = fs.readFileSync(templatePath, 'utf-8')

  // Inject the prerender-shell CSS once into the template head
  if (!template.includes('.prerender-shell')) {
    template = template.replace('</head>', `${PRERENDER_CSS}\n  </head>`)
  }

  const routes = buildRoutes()
  const failures: string[] = []
  let written = 0

  // Also rewrite the root / with home metadata (template already has it, but
  // ensure consistency with our route definition)
  const seen = new Set<string>()

  for (const r of routes) {
    if (seen.has(r.path)) continue
    seen.add(r.path)

    try {
      const html = buildRouteHtml(template, r)
      const isRoot = r.path === '/'
      const outPath = isRoot
        ? path.join(outDir, 'index.html')
        : path.join(outDir, r.path.replace(/^\//, ''), 'index.html')
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, html, 'utf-8')
      written++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      failures.push(`${r.path}: ${msg}`)
    }
  }

  return { total: written, sampleFailures: failures.slice(0, 5) }
}
