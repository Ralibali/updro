import { describe, expect, it } from 'vitest'
import databaseArticles from '../content/editorial/database-published.json'
import { ARTICLES } from './seoArticles'
import { generateSectionSitemapXml, generateSitemapXml, getAllStaticSeoRoutes, renderStaticHtml } from './seoStatic'

describe('published database inventory reaches search and readers', () => {
  it('preserves each published DB article in HTML, listing and both sitemaps', () => {
    const routes = getAllStaticSeoRoutes()
    const list = routes.find(route => route.path === '/artiklar')!
    const flat = generateSitemapXml()
    const section = generateSectionSitemapXml('articles')
    for (const article of databaseArticles) {
      const path = `/artiklar/${article.slug}`
      const route = routes.find(route => route.path === path)!
      expect(route, path).toBeDefined()
      expect(ARTICLES.filter(item => item.slug === article.slug)).toHaveLength(1)
      expect(route.intro).toBe(article.intro)
      expect(route.sections).toEqual(article.sections)
      expect(route.article?.published).toBe(article.publishedDate)
      expect(list.links).toContainEqual({ label: article.h1, href: path })
      for (const sitemap of [flat, section]) expect(sitemap).toContain(`<loc>https://updro.se${path}</loc>`)
      const html = renderStaticHtml('<html><head></head><body><div id="root"></div></body></html>', route)
      expect(html).toContain(article.sections.at(-1)!.heading)
      expect((html.match(/<h1[ >]/g) || []).length).toBe(1)
      expect(html).toContain(`<link rel="canonical" href="https://updro.se${path}"`)
    }
  })
})
