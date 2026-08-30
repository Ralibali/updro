#!/usr/bin/env bun
/**
 * Post-build prerender: uses the existing renderStaticHtml() in
 * src/lib/seoStatic.ts to emit a static HTML file per SEO route into
 * dist/<path>/index.html. Runs after `vite build`.
 *
 * Requires bun (already the project's packageManager) so we can import
 * the TypeScript module directly without an extra build step.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const { getAllStaticSeoRoutes, renderStaticHtml } = await import(
  path.join(ROOT, 'src/lib/seoStatic.ts')
)
const { PARTNA_FACTS, PARTNA_FAQS } = await import(
  path.join(ROOT, 'src/lib/partnaComparison.ts')
)

const templatePath = path.join(DIST, 'index.html')
let template
try {
  template = await fs.readFile(templatePath, 'utf8')
} catch (err) {
  console.error(`❌ prerender: could not read ${templatePath}. Run \`vite build\` first.`)
  process.exit(1)
}

const partnaSeoOverride = route => {
  if (route.path !== '/partna-alternativ') return route
  return {
    ...route,
    title: 'Partna pris 2026 & alternativ – Updro vs Partna',
    description: `Jämför Partna och Updro: ${PARTNA_FACTS.payAsYouGo} kr per Partna-förfrågan, ${Math.round(PARTNA_FACTS.successFeeRate * 100)} % slagavgift vid vunnen affär, upp till ${PARTNA_FACTS.maxOffers} offerter – mot Updros 119 kr per valt lead och max tre byråer.`,
    h1: 'Partna pris och alternativ – Updro vs Partna',
    faq: PARTNA_FAQS.map(item => ({ q: item.q, a: item.a })),
  }
}

const routes = getAllStaticSeoRoutes().map(partnaSeoOverride)
let written = 0
const errors = []

const count = (html, regex) => (html.match(regex) || []).length
const MIN_INTERNAL_LINKS = 10

// Hårda kontroller per sida – exakt en av varje unik head-tagg/H1/header/footer
// samt tillräckligt många interna länkar för en crawlbar site-struktur.
const verifyPage = (routePath, html) => {
  const checks = {
    title: count(html, /<title>/gi),
    description: count(html, /<meta\s+name="description"/gi),
    canonical: count(html, /<link\s+rel="canonical"/gi),
    robots: count(html, /<meta\s+name="robots"/gi),
    h1: count(html, /<h1[\s>]/gi),
    header: count(html, /<header[\s>]/gi),
    footer: count(html, /<footer[\s>]/gi),
  }
  const bad = Object.entries(checks).filter(([, value]) => value !== 1)
  if (bad.length) {
    errors.push(`${routePath}: ${bad.map(([key, value]) => `${key}=${value}`).join(', ')}`)
    return false
  }
  const internalLinks = count(html, /<a\s[^>]*href="\/(?!\/)/gi)
  if (internalLinks < MIN_INTERNAL_LINKS) {
    errors.push(`${routePath}: endast ${internalLinks} interna länkar (minst ${MIN_INTERNAL_LINKS} krävs)`)
    return false
  }
  return true
}

for (const route of routes) {
  const rel = route.path === '/' ? '' : route.path.replace(/^\/+|\/+$/g, '')
  const outDir = rel ? path.join(DIST, rel) : DIST
  const outFile = path.join(outDir, 'index.html')

  const html = renderStaticHtml(template, route)
  if (!verifyPage(route.path, html)) continue

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, html, 'utf8')
  written++
}

// dist/404.html: noindex + svensk 404-text, samma nav/footer som övriga sidor.
// Värdar som serverar 404.html för okända vägar får då korrekt innehåll.
const notFoundRoute = {
  path: '/404',
  title: 'Sidan hittades inte (404) | Updro',
  description: 'Sidan du letar efter finns inte eller har flyttats. Hitta digitala byråer, guider och verktyg på Updro.',
  h1: 'Sidan hittades inte',
  priority: 0.1,
  changefreq: 'yearly',
  noindex: true,
  links: [
    { label: 'Till startsidan', href: '/' },
    { label: 'Hitta digitala byråer', href: '/byraer' },
    { label: 'Beskriv ditt projekt', href: '/publicera' },
    { label: 'Artiklar och guider', href: '/artiklar' },
    { label: 'Gratis verktyg', href: '/verktyg' },
    { label: 'Priser', href: '/priser' },
  ],
}
const notFoundHtml = renderStaticHtml(template, notFoundRoute)
if (verifyPage('/404', notFoundHtml)) {
  if (!notFoundHtml.includes('noindex')) {
    errors.push('/404: saknar noindex')
  } else {
    await fs.writeFile(path.join(DIST, '404.html'), notFoundHtml, 'utf8')
    written++
  }
}

if (errors.length) {
  console.error(`❌ prerender: ${errors.length} sidor med dubbletter/saknade taggar eller för få interna länkar:`)
  for (const error of errors) console.error(`   - ${error}`)
  process.exit(1)
}

console.log(`✅ prerender: wrote ${written} static HTML files to dist/ (${routes.length} routes + 404.html)`)
