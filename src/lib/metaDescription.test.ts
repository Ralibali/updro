import { describe, expect, it } from 'vitest'
import { completeMetaDescription } from './metaDescription'
import { getAllStaticSeoRoutes } from './seoStatic'
import { SEO_PAGES } from './seoData'

describe('completeMetaDescription', () => {
  it('extends short descriptions with the offer', () => {
    expect(completeMetaDescription('Hitta IT-support i Malmö.')).toBe('Hitta IT-support i Malmö. Beskriv projektet gratis och jämför högst tre relevanta offerter.')
    expect(completeMetaDescription('Jämför PR-byråer')).toBe('Jämför PR-byråer. Beskriv projektet gratis och jämför högst tre relevanta offerter.')
  })
  it('keeps complete descriptions and truncates on a word boundary', () => {
    const good = 'Vad kostar en hemsida 2026? Se prisspann för olika typer av webbplatser och vad som påverkar priset hos svenska byråer.'
    expect(completeMetaDescription(good)).toBe(good)
    const long = completeMetaDescription(`${good} ${good}`)
    expect(long.length).toBeLessThanOrEqual(155)
    expect(long.endsWith('…')).toBe(true)
  })
  it('strips markdown and handles missing input', () => {
    expect(completeMetaDescription('**Snabb** hjälp med [SEO](/seo) i Umeå.')).toBe('Snabb hjälp med SEO i Umeå. Beskriv projektet gratis och jämför högst tre relevanta offerter.')
    expect(completeMetaDescription(undefined)).toBe('')
    expect(completeMetaDescription(null)).toBe('')
  })
  it('gives indexable service pages descriptions of 90–155 characters', () => {
    const paths = new Set(SEO_PAGES.flatMap(page => [`/${page.categorySlug}`, ...(page.subPages || []).map(sub => `/${page.categorySlug}/${sub.slug}`)]))
    const invalid = getAllStaticSeoRoutes().filter(route => paths.has(route.path) && !route.noindex && (route.description.length < 90 || route.description.length > 155))
    expect(invalid.map(route => `${route.path} (${route.description.length})`)).toEqual([])
  })
})
