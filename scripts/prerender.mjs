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

const templatePath = path.join(DIST, 'index.html')
let template
try {
  template = await fs.readFile(templatePath, 'utf8')
} catch (err) {
  console.error(`❌ prerender: could not read ${templatePath}. Run \`vite build\` first.`)
  process.exit(1)
}

const routes = getAllStaticSeoRoutes()
let written = 0
let skipped = 0

for (const route of routes) {
  const rel = route.path === '/' ? '' : route.path.replace(/^\/+|\/+$/g, '')
  const outDir = rel ? path.join(DIST, rel) : DIST
  const outFile = path.join(outDir, 'index.html')

  // Never overwrite the root index.html (SPA entry). The root route is
  // still served correctly because Vite's index.html is the template.
  if (route.path === '/') {
    // Root: rewrite in place so crawlers hitting `/` see the real title/H1/meta.
    const html = renderStaticHtml(template, route)
    await fs.writeFile(outFile, html, 'utf8')
    written++
    continue
  }

  const html = renderStaticHtml(template, route)

  // Sanity checks — refuse to write broken output.
  const okTitle = html.includes(`<title>`) && html.includes(route.title.slice(0, 30))
  const okH1 = html.includes(`<h1>`) && html.includes(route.h1.slice(0, 20))
  const okCanonical = html.includes(`rel="canonical"`) && html.includes(route.path === '/' ? 'https://updro.se/' : `https://updro.se${route.path}`)
  if (!okTitle || !okH1 || !okCanonical) {
    console.warn(`⚠️  prerender: skipping ${route.path} (title=${okTitle} h1=${okH1} canonical=${okCanonical})`)
    skipped++
    continue
  }

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, html, 'utf8')
  written++
}

console.log(`✅ prerender: wrote ${written} static HTML files to dist/ (${skipped} skipped, ${routes.length} total routes)`)
