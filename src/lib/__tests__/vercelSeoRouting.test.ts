import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getAllStaticSeoRoutes, SITE_URL } from '@/lib/seoStatic'

const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
  cleanUrls?: boolean
  redirects?: { source: string; destination: string; permanent?: boolean }[]
  rewrites?: { source: string; destination: string }[]
}

const prerenderSource = readFileSync(resolve(process.cwd(), 'scripts/prerender.mjs'), 'utf8')

const SEO_QA_ROUTES = ['/', '/publicera', '/byraer'] as const
const SPA_WIZARD_PREFILL = '/publicera/webbutveckling'
const LEGACY_301S = [
  ['/hemsida-pris-kalkylator', '/verktyg/hemsida-pris-kalkylator'],
  ['/vad-kostar-en-hemsida-kalkylator', '/verktyg/hemsida-pris-kalkylator'],
  ['/webbyra-stockholm', '/byraer/stockholm'],
  ['/webbyra-goteborg', '/byraer/goteborg'],
  ['/webbyra-malmo', '/byraer/malmo'],
  ['/seo-byra-stockholm', '/seo/stockholm'],
  ['/seo-byra-goteborg', '/seo/goteborg'],
  ['/seo-byra-malmo', '/seo/malmo'],
] as const

const spaFallbackMatches = (requestPath: string, source: string) => {
  const body = source.replace(/^\//, '')
  return new RegExp(`^/${body}$`).test(requestPath)
}

describe('Vercel SEO/SPA routing contract', () => {
  const routes = getAllStaticSeoRoutes()
  const byPath = new Map(routes.map(route => [route.path, route]))
  const rewrite = vercel.rewrites?.[0]

  it('keeps the existing permanent redirects', () => {
    for (const [source, destination] of LEGACY_301S) {
      expect(vercel.redirects).toContainEqual({
        source,
        destination,
        permanent: true,
      })
    }
    expect(vercel.redirects).toHaveLength(LEGACY_301S.length)
  })

  it('keeps the working extensionless SPA fallback to /index.html', () => {
    expect(vercel.cleanUrls).toBeUndefined()
    expect(vercel.rewrites).toHaveLength(1)
    expect(rewrite?.destination).toBe('/index.html')
    expect(rewrite?.source).toContain('(?!.*\\.)')
  })

  it('does not rewrite sitemap and robots because they have extensions', () => {
    expect(rewrite).toBeTruthy()
    for (const filePath of ['/sitemap.xml', '/sitemap-index.xml', '/sitemap-main.xml', '/robots.txt']) {
      expect(spaFallbackMatches(filePath, rewrite!.source)).toBe(false)
    }
  })

  it('prerenders the three Preview SEO QA routes with distinct title/canonical', () => {
    const titles = new Set<string>()
    for (const path of SEO_QA_ROUTES) {
      const route = byPath.get(path)
      expect(route, `missing prerender route ${path}`).toBeTruthy()
      expect(route!.title).toBeTruthy()
      expect(route!.h1).toBeTruthy()
      titles.add(route!.title)
    }
    expect(titles.size).toBe(SEO_QA_ROUTES.length)
    expect(byPath.get('/')!.title).not.toBe(byPath.get('/publicera')!.title)
    expect(byPath.get('/publicera')!.title).not.toBe(byPath.get('/byraer')!.title)
    expect(`${SITE_URL}${byPath.get('/byraer')!.path}`).toBe('https://updro.se/byraer')
  })

  it('does not prerender /publicera/webbutveckling — not a one-line include', () => {
    expect(byPath.has(SPA_WIZARD_PREFILL)).toBe(false)
    expect(prerenderSource).toContain('getAllStaticSeoRoutes()')
    expect(prerenderSource).not.toContain(SPA_WIZARD_PREFILL)
    expect(prerenderSource).toMatch(/dist\/<path>\/index\.html/)
    expect(prerenderSource).not.toContain('`${rel}.html`')
  })
})
