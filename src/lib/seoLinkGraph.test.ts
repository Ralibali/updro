import { describe, expect, it } from 'vitest'
import { getAllStaticSeoRoutes, getBreadcrumbs, ogImageFor, renderStaticHtml } from './seoStatic'
import { SEO_PAGES } from './seoData'
import { ARTICLES } from './seoArticles'
import { COMPARISON_PAGES } from './seoComparisons'
import { mergeDeep } from './seoDeepEnrichment'
import { LEGACY_REDIRECTS, renderLegacyRedirectHtml } from './seoRedirects'

const routes = getAllStaticSeoRoutes()
const byPath = new Map(routes.map(route => [route.path, route]))
const noindex = new Set(routes.filter(route => route.noindex).map(route => route.path))
const TEMPLATE = '<!doctype html><html lang="sv"><head><title>x</title></head><body><div id="root"></div></body></html>'
const rendered = routes.map(route => ({
  path: route.path,
  html: renderStaticHtml(TEMPLATE, route),
}))
const internalLinks = rendered.flatMap(({ path, html }) =>
  [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].flatMap(match => {
    const url = new URL(match[1], 'https://updro.se')
    return url.origin === 'https://updro.se' ? [{ from: path, to: url.pathname.replace(/(.)\/$/, '$1') }] : []
  }),
)

describe('production static link graph', () => {
  it('has no links to noindex pages, including enriched content, navigation and footers', () => {
    expect(internalLinks.filter(link => noindex.has(link.to))).toEqual([])
  })
  it('gives every indexable page an inbound link', () => {
    const linked = new Set(internalLinks.filter(link => link.from !== link.to).map(link => link.to))
    expect(routes.filter(route => !route.noindex && route.path !== '/' && !linked.has(route.path)).map(route => route.path)).toEqual([])
  })
  it('builds breadcrumbs only through existing pages', () => {
    expect(routes.flatMap(route => getBreadcrumbs(route).slice(1, -1).filter(crumb => !byPath.has(crumb.path)))).toEqual([])
    const category = routes.find(route => route.path.startsWith('/byraer/kategori/'))!
    expect(getBreadcrumbs(category).map(crumb => crumb.path)).toEqual(['/', '/byraer', category.path])
  })
  it('links the static agency navigation to the same landing page as Navbar', () => {
    expect(rendered[0].html).toContain('<a href="/for-byraer">För byråer</a>')
    expect(rendered[0].html).not.toContain('<a href="/registrera/byra">För byråer</a>')
  })
})

describe('complete production content', () => {
  const sources = [
    ...SEO_PAGES.flatMap(page => [
      { path: `/${page.categorySlug}`, page, enrich: true },
      ...page.subPages.map(sub => ({ path: `/${page.categorySlug}/${sub.slug}`, page: sub, enrich: true })),
    ]),
    ...ARTICLES.map(page => ({ path: `/artiklar/${page.slug}`, page, enrich: true })),
    ...COMPARISON_PAGES.map(page => ({ path: `/${page.slug}`, page, enrich: !page.reviewedAt })),
  ]
  it('preserves all React sections and FAQ, including questions after the fifth', () => {
    for (const { path, page, enrich } of sources) {
      const expected = { sections: [...page.sections], faq: [...page.faq] }
      if (enrich) mergeDeep(expected, path)
      expect(byPath.get(path)?.sections, path).toEqual(expected.sections)
      expect(byPath.get(path)?.faq, path).toEqual(expected.faq)
    }
  })
  it('renders enriched headings and the full FAQ in both HTML and structured data', () => {
    const route = byPath.get('/seo/pris')!
    expect(route.sections!.length).toBeGreaterThan(3)
    const html = renderStaticHtml(TEMPLATE, route)
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph']
    const faq = graph.find((node: { '@type': string }) => node['@type'] === 'FAQPage')
    expect(faq.mainEntity).toHaveLength(route.faq!.length)
    for (const section of route.sections!) expect(html).toContain(section.heading)
    for (const question of route.faq!) expect(faq.mainEntity.map((item: { name: string }) => item.name)).toContain(question.q)
  })
  it('does not mutate source arrays or duplicate content across successive builds', () => {
    const snapshot = JSON.stringify(sources.map(source => source.page))
    const first = getAllStaticSeoRoutes()
    expect(getAllStaticSeoRoutes()).toEqual(first)
    expect(JSON.stringify(sources.map(source => source.page))).toBe(snapshot)
    for (const { path, page } of sources) {
      expect(first.find(route => route.path === path)?.sections).not.toBe(page.sections)
      expect(first.find(route => route.path === path)?.faq).not.toBe(page.faq)
    }
  })
})

describe('sharing and article schema', () => {
  it('selects category and comparison images', () => {
    expect(ogImageFor('/seo/pris')).toBe('https://updro.se/og/og-seo.png')
    expect(ogImageFor('/priser/e-handel')).toBe('https://updro.se/og/og-ehandel.png')
    expect(ogImageFor('/artiklar/nagot')).toBe('https://updro.se/og/og-artiklar.png')
    expect(ogImageFor('/partna-alternativ')).toBe('https://updro.se/og/og-jamfor.png')
    expect(ogImageFor('/om-oss')).toBe('https://updro.se/og/og-default.png')
  })
  it('includes organization authorship, dates, publisher and social metadata', () => {
    const article = routes.find(route => route.path.startsWith('/artiklar/'))!
    const html = renderStaticHtml(TEMPLATE, article)
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph']
    const node = graph.find((item: { '@type': string }) => item['@type'] === 'Article')
    expect(node).toMatchObject({ headline: article.h1, author: { '@type': 'Organization' }, publisher: { '@id': 'https://updro.se/#organization' } })
    expect(node.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/)
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="og:locale" content="sv_SE" />')
    expect(html).toContain(`<meta name="twitter:image" content="${ogImageFor(article.path)}" />`)
  })
})

describe('legacy static redirects', () => {
  it('does not overwrite pages and always targets an existing indexable page', () => {
    expect(new Set(LEGACY_REDIRECTS.map(redirect => redirect.from)).size).toBe(LEGACY_REDIRECTS.length)
    for (const { from, to } of LEGACY_REDIRECTS) {
      expect(byPath.has(from), from).toBe(false)
      expect(byPath.has(to), to).toBe(true)
      expect(noindex.has(to), to).toBe(false)
      const html = renderLegacyRedirectHtml(to)
      expect(html).toContain(`<link rel="canonical" href="https://updro.se${to}" />`)
      expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${to}" />`)
      expect(html).toContain(`<a href="${to}">`)
      const script = html.match(/<script>(.*?)<\/script>/)![1]
      const targets: string[] = []
      new Function('location', script)({ search: '?utm_source=test', hash: '#pris', replace: (url: string) => targets.push(url) })
      expect(targets).toEqual([`${to}?utm_source=test#pris`])
    }
  })
  it('rejects unsafe or nonlocal redirect destinations', () => {
    for (const to of ['https://example.com', '//example.com', '/a/../b', '/a" onclick="alert(1)', '/a<script>']) {
      expect(() => renderLegacyRedirectHtml(to)).toThrow()
    }
  })
})
