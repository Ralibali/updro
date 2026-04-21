#!/usr/bin/env node
/**
 * Generate static sitemap files into /public.
 * Run: npm run sitemap:generate
 *
 * Uses tsx-on-the-fly via dynamic import + esbuild compatible TS through
 * the project's existing toolchain (tsx is not a dep, so we shell out to vite-node).
 *
 * Simpler approach: import the compiled output is too coupled. Instead we
 * use the tsx CLI if available, else fall back to esbuild+vm.
 *
 * The cleanest path for this repo is to run via `node --import` with esbuild.
 * To stay zero-deps we keep the generator pure and inline the data here is
 * not viable — so we require the user has @swc/register or ts-node. Most
 * Vite-react projects with `bun` available can do `bunx tsx scripts/...`.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public')

async function loadGenerator() {
  // Bundle the TS source on the fly to ESM in memory and import it.
  const result = await build({
    entryPoints: [join(ROOT, 'src/lib/generateSitemap.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    target: 'node18',
    absWorkingDir: ROOT,
  })
  const code = result.outputFiles[0].text
  // Use a data URL import so node treats it as ESM
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
  return import(dataUrl)
}

const main = async () => {
  const mod = await loadGenerator()
  const {
    buildMainSitemapXml, buildCitiesSitemapXml, buildArticlesSitemapXml,
    buildSitemapIndexXml, buildSingleSitemapXml, getAllUrls,
  } = mod

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'sitemap.xml'), buildSingleSitemapXml())
  writeFileSync(join(OUT_DIR, 'sitemap-index.xml'), buildSitemapIndexXml())
  writeFileSync(join(OUT_DIR, 'sitemap-main.xml'), buildMainSitemapXml())
  writeFileSync(join(OUT_DIR, 'sitemap-cities.xml'), buildCitiesSitemapXml())
  writeFileSync(join(OUT_DIR, 'sitemap-articles.xml'), buildArticlesSitemapXml())

  const all = getAllUrls()
  console.log(`✓ Sitemap generated`)
  console.log(`  /sitemap.xml             ${all.length} URLs (single file)`)
  console.log(`  /sitemap-index.xml       index pointing to 3 sub-sitemaps`)
  console.log(`  /sitemap-main.xml        core + pillars + tools + comparisons`)
  console.log(`  /sitemap-cities.xml      ${getAllUrls().filter(u => u.loc.includes('/byraer/') || u.loc.includes('/stader/')).length} city + city×category URLs`)
  console.log(`  /sitemap-articles.xml    articles + knowledge bank`)
}

main().catch(err => { console.error(err); process.exit(1) })
