import { describe, expect, it } from 'vitest'
import {
  SITE_URL,
  getAllStaticSeoRoutes,
  getBreadcrumbs,
  getIndexableSeoRoutes,
  getNoindexSeoRoutes,
  renderStaticHtml,
  type StaticSeoRoute,
} from './seoStatic'
import { FOOTER_CITY_LINKS, FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from './footerLinks'

const TEMPLATE = `<!doctype html>
<html lang="sv">
  <head>
    <title>Malltitel</title>
    <meta name="description" content="mallbeskrivning" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="/" />
    <meta property="og:title" content="mall" />
    <meta name="twitter:card" content="summary" />
    <script type="application/ld+json">{"@context":"https://schema.org","@graph":[]}</script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

const routes = getAllStaticSeoRoutes()
const route = (path: string) => {
  const found = routes.find(candidate => candidate.path === path)
  if (!found) throw new Error(`Saknar route ${path}`)
  return found
}
const countMatches = (html: string, regex: RegExp) => (html.match(regex) || []).length
const internalLinks = (html: string) => countMatches(html, /<a\s[^>]*href="\/(?!\/)/gi)
const render = (path: string) => renderStaticHtml(TEMPLATE, route(path))

describe('seoStatic routes', () => {
  it('har unika paths', () => {
    const paths = routes.map(candidate => candidate.path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.length).toBeGreaterThan(50)
  })

  it('alltid har title, description och h1', () => {
    for (const candidate of routes) {
      expect(candidate.title.trim().length, candidate.path).toBeGreaterThan(0)
      expect(candidate.description.trim().length, candidate.path).toBeGreaterThan(0)
      expect(candidate.h1.trim().length, candidate.path).toBeGreaterThan(0)
    }
  })
})

describe('renderStaticHtml head-metadata', () => {
  it('ger exakt en title, description, canonical, robots, H1 och JSON-LD', () => {
    for (const path of ['/', '/seo', '/byraer', '/priser/seo', '/byraer/stockholm/webbutveckling']) {
      const html = render(path)
      expect(countMatches(html, /<title>/gi), path).toBe(1)
      expect(countMatches(html, /<meta\s+name="description"/gi), path).toBe(1)
      expect(countMatches(html, /<link\s+rel="canonical"/gi), path).toBe(1)
      expect(countMatches(html, /<meta\s+name="robots"/gi), path).toBe(1)
      expect(countMatches(html, /<h1[\s>]/gi), path).toBe(1)
      expect(countMatches(html, /<script type="application\/ld\+json">/gi), path).toBe(1)
    }
  })

  it('skriver absolut canonical', () => {
    expect(render('/')).toContain(`<link rel="canonical" href="${SITE_URL}/" />`)
    expect(render('/seo')).toContain(`<link rel="canonical" href="${SITE_URL}/seo" />`)
  })

  it('sätter noindex på noindex-routes och index på indexbara', () => {
    const noindexRoute = getNoindexSeoRoutes()[0]
    expect(noindexRoute).toBeDefined()
    expect(renderStaticHtml(TEMPLATE, noindexRoute)).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(render(getIndexableSeoRoutes()[0].path)).toContain('content="index, follow')
  })
})

describe('renderStaticHtml crawlbar body', () => {
  it('har exakt en header och en footer', () => {
    for (const path of ['/', '/seo', '/byraer/stockholm']) {
      const html = render(path)
      expect(countMatches(html, /<header[\s>]/gi), path).toBe(1)
      expect(countMatches(html, /<footer[\s>]/gi), path).toBe(1)
    }
  })

  it('header speglar Navbar med huvudlänkar, kategorier och CTA', () => {
    const html = render('/')
    expect(html).toContain('aria-label="Huvudnavigation"')
    expect(html).toContain('<a href="/byraer">Hitta byrå</a>')
    expect(html).toContain('<a href="/registrera/byra">För byråer</a>')
    expect(html).toContain('<a href="/om-oss">Om Updro</a>')
    expect(html).toContain('<a href="/publicera">Beskriv ditt projekt</a>')
    expect(html).toContain('aria-label="Kategorier"')
    // Samtliga tjänstekategorier ska vara crawlbara från headern.
    expect(html).toContain('<a href="/webbutveckling">')
    expect(html).toContain('<a href="/seo">')
  })

  it('footer speglar Footer.tsx via delade FOOTER_-data', () => {
    const html = render('/')
    for (const column of FOOTER_COLUMNS) {
      expect(html).toContain(`<h2>${column.title.replace('&', '&amp;')}</h2>`)
      for (const link of column.links) expect(html).toContain(`href="${link.href}"`)
    }
    for (const city of FOOTER_CITY_LINKS) expect(html).toContain(`href="${city.href}"`)
    for (const legal of FOOTER_LEGAL_LINKS) expect(html).toContain(`href="${legal.href}"`)
    expect(html).toContain('Aurora Media AB')
  })

  it('har minst 10 interna länkar per sida', () => {
    for (const candidate of ['/', '/seo', '/byraer', '/artiklar', '/verktyg', '/byraer/stockholm/webbutveckling']) {
      expect(internalLinks(render(candidate)), candidate).toBeGreaterThanOrEqual(10)
    }
  })
})

describe('brödsmulor och BreadcrumbList', () => {
  it('startsidan har varken brödsmulor eller BreadcrumbList', () => {
    const html = render('/')
    expect(html).not.toContain('aria-label="Brödsmulor"')
    expect(html).not.toContain('BreadcrumbList')
    expect(getBreadcrumbs(route('/'))).toEqual([])
  })

  it('undersidor får brödsmulor med Hem först och aktuell sida sist', () => {
    const crumbs = getBreadcrumbs(route('/byraer/stockholm'))
    expect(crumbs[0]).toEqual({ name: 'Hem', path: '/' })
    expect(crumbs[crumbs.length - 1].path).toBe('/byraer/stockholm')
    const html = render('/byraer/stockholm')
    expect(html).toContain('aria-label="Brödsmulor"')
    expect(html).toContain('aria-current="page"')
  })

  it('undersidor får BreadcrumbList i JSON-LD med korrekta positioner', () => {
    const html = render('/byraer/stockholm')
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    expect(match).toBeTruthy()
    const graph = JSON.parse(match![1])['@graph'] as { '@type': string; itemListElement?: { position: number; name: string; item: string }[] }[]
    const breadcrumbList = graph.find(node => node['@type'] === 'BreadcrumbList')
    expect(breadcrumbList).toBeDefined()
    expect(breadcrumbList!.itemListElement![0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Hem', item: `${SITE_URL}/` })
    expect(breadcrumbList!.itemListElement!.at(-1)!.item).toBe(`${SITE_URL}/byraer/stockholm`)
    // Befintliga scheman ska finnas kvar.
    for (const type of ['Organization', 'WebSite', 'WebPage']) {
      expect(graph.some(node => node['@type'] === type), type).toBe(true)
    }
  })
})

describe('renderStaticHtml robusthet', () => {
  it('escapar HTML i title, H1, länkar och FAQ', () => {
    const nasty: StaticSeoRoute = {
      path: '/test-esc',
      title: 'A & B <script> "citat"',
      description: 'beskrivning & <tag>',
      h1: 'Rubrik & <b>',
      priority: 0.5,
      changefreq: 'monthly',
      links: [{ label: 'Länk & <em>', href: '/byraer' }],
      faq: [{ q: 'Fråga & <i>?', a: 'Svar & <u>' }],
    }
    const html = renderStaticHtml(TEMPLATE, nasty)
    expect(html).toContain('<title>A &amp; B &lt;script&gt; &quot;citat&quot;</title>')
    expect(html).toContain('<h1>Rubrik &amp; &lt;b&gt;</h1>')
    expect(html).toContain('Länk &amp; &lt;em&gt;')
    expect(html).not.toContain('<b></h1>')
  })

  it('kastar fel om rot-elementet saknas i mallen', () => {
    const broken = TEMPLATE.replace('<div id="root"></div>', '<div id="app"></div>')
    expect(() => renderStaticHtml(broken, route('/'))).toThrow(/root/)
  })

  it('kastar fel om </head> saknas i mallen', () => {
    const broken = TEMPLATE.replace('</head>', '')
    expect(() => renderStaticHtml(broken, route('/'))).toThrow(/head/)
  })

  it('bevarar FAQPage-schema för routes med FAQ', () => {
    const withFaq = routes.find(candidate => candidate.faq?.length)
    expect(withFaq).toBeDefined()
    const html = renderStaticHtml(TEMPLATE, withFaq!)
    expect(html).toContain('FAQPage')
    expect(html).toContain('<h2>Vanliga frågor</h2>')
  })
})
