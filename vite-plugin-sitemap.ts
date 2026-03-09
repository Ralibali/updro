import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

/**
 * Vite plugin that generates sitemap.xml at build time
 * by dynamically importing the SEO data modules.
 */
export function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    async closeBundle() {
      // Dynamic import to load the TS modules via Vite's pipeline
      const { generateSitemapXml } = await import('./src/lib/seoHelpers')
      const xml = generateSitemapXml()
      const outPath = path.resolve(__dirname, 'dist/sitemap.xml')
      fs.writeFileSync(outPath, xml, 'utf-8')
      console.log(`✅ sitemap.xml generated (${xml.split('<url>').length - 1} URLs)`)
    },
  }
}
