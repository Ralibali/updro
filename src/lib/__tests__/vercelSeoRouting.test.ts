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

const SEO_QA_ROUTES = ['/', '/publicera', '/webbutveckling'] as const
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

/** Paths Vercel cleanUrls can resolve as files before SPA fallback. */
const prerenderFilesFor = (routePath: string) => {
  if (routePath === '/') return ['/index.html']
  const rel = routePath.replace(/^\/+|\/+$/g, '')
  return [`/${rel}/index.html`, `/${rel}.html`]
}

const spaFallbackMatches = (requestPath: string, source: string) => {
  const body = source.replace(/^\//, '')
  return new RegExp(`^/${body}$`).test(requestPath)
}

const resolveFirstHtml = (
  requestPath: string,
  files: Set<string>,
  rewriteSource: string,
  rewriteDestination: string,
) => {
  const htmlForCleanUrl = requestPath === '/' ? '/index.html' : `${requestPath}.html`
  if (files.has(htmlForCleanUrl)) return htmlForCleanUrl

  const directoryIndex = requestPath === '/' ? '/index.html' : `${requestPath}/index.html`
  if (files.has(directoryIndex)) return directoryIndex

  if (requestPath.includes('.') && files.has(requestPath)) return requestPath
  if (spaFallbackMatches(requestPath, rewriteSource)) return `${rewriteDestination}.html`
  return requestPath
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

  it('uses cleanUrls plus an extensionless SPA fallback so prerendered .html files win', () => {
    expect(vercel.cleanUrls).toBe(true)
    expect(vercel.rewrites).toHaveLength(1)
    expect(rewrite?.destination).toBe('/index')
    expect(rewrite?.source).toContain('(?!.*\\.)')
    expect(prerenderSource).toContain('`${rel}.html`')
    expect(prerenderSource).toContain('cleanUrls')
  })

  it('does not rewrite sitemap and robots because they have extensions', () => {
    expect(rewrite).toBeTruthy()
    for (const filePath of ['/sitemap.xml', '/sitemap-index.xml', '/sitemap-main.xml', '/robots.txt']) {
      expect(spaFallbackMatches(filePath, rewrite!.source)).toBe(false)
    }
  })

  it('prerenders the three Preview SEO QA routes with distinct title/canonical/data-static-route', () => {
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
    expect(`${SITE_URL}${byPath.get('/publicera')!.path}`).toBe('https://updro.se/publicera')
  })

  it('does not prerender /publicera/webbutveckling — that remains a wizard SPA prefill', () => {
    expect(byPath.has(SPA_WIZARD_PREFILL)).toBe(false)
    expect(prerenderSource).toContain('getAllStaticSeoRoutes()')
    expect(prerenderSource).not.toContain(SPA_WIZARD_PREFILL)
  })

  it('serves prerendered HTML for SEO routes and index.html only for unknown SPA paths', () => {
    const files = new Set(routes.flatMap(route => prerenderFilesFor(route.path)))
    files.add('/sitemap.xml')
    files.add('/robots.txt')

    expect(resolveFirstHtml('/', files, rewrite!.source, rewrite!.destination)).toBe('/index.html')
    expect(resolveFirstHtml('/publicera', files, rewrite!.source, rewrite!.destination)).toBe('/publicera.html')
    expect(resolveFirstHtml('/webbutveckling', files, rewrite!.source, rewrite!.destination)).toBe('/webbutveckling.html')
    expect(resolveFirstHtml('/sitemap.xml', files, rewrite!.source, rewrite!.destination)).toBe('/sitemap.xml')
    expect(resolveFirstHtml('/robots.txt', files, rewrite!.source, rewrite!.destination)).toBe('/robots.txt')
    expect(resolveFirstHtml(SPA_WIZARD_PREFILL, files, rewrite!.source, rewrite!.destination)).toBe('/index.html')
    expect(resolveFirstHtml('/logga-in', files, rewrite!.source, rewrite!.destination)).toBe('/index.html')
    expect(resolveFirstHtml('/dashboard/buyer', files, rewrite!.source, rewrite!.destination)).toBe('/index.html')
  })
})
