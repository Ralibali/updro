#!/usr/bin/env bun
/**
 * Post-build prerender: uses the existing renderStaticHtml() in
 * src/lib/seoStatic.ts to emit a static HTML file per SEO route into
 * dist/<path>/index.html and dist/<path>.html. The sibling .html file
 * lets Vercel cleanUrls serve the route before the SPA fallback.
 * Runs after `vite build`.
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

for (const route of routes) {
  const rel = route.path === '/' ? '' : route.path.replace(/^\/+|\/+$/g, '')
  const outDir = rel ? path.join(DIST, rel) : DIST
  const outFile = path.join(outDir, 'index.html')

  const html = renderStaticHtml(template, route)

  // Hårda kontroller – exakt en av varje unik head-tagg och en H1.
  const checks = {
    title: count(html, /<title>/gi),
    description: count(html, /<meta\s+name="description"/gi),
    canonical: count(html, /<link\s+rel="canonical"/gi),
    robots: count(html, /<meta\s+name="robots"/gi),
    h1: count(html, /<h1[\s>]/gi),
  }
  const bad = Object.entries(checks).filter(([, value]) => value !== 1)
  if (bad.length) {
    errors.push(`${route.path}: ${bad.map(([key, value]) => `${key}=${value}`).join(', ')}`)
    continue
  }

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, html, 'utf8')
  // Sibling .html so Vercel cleanUrls/filesystem can serve this route
  // before the SPA fallback rewrite. Directory index.html still covers
  // trailing-slash requests.
  if (rel) {
    const sibling = path.join(DIST, `${rel}.html`)
    await fs.mkdir(path.dirname(sibling), { recursive: true })
    await fs.writeFile(sibling, html, 'utf8')
  }
  written++
}

if (errors.length) {
  console.error(`❌ prerender: ${errors.length} routes med dubbletter/saknade taggar:`)
  for (const error of errors) console.error(`   - ${error}`)
  process.exit(1)
}

console.log(`✅ prerender: wrote ${written} static HTML files to dist/ (${routes.length} total routes)`)
