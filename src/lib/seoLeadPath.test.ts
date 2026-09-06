import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './constants'
import { SEO_AGENCY_CATEGORIES } from './seoAgencyData'
import { seoLeadPath } from './seoLeadPath'

describe('SEO entry points', () => {
  it('preserves valid wizard categories for every agency service', () => {
    for (const service of SEO_AGENCY_CATEGORIES) {
      const url = new URL(seoLeadPath(service.slug), 'https://updro.se')
      expect(CATEGORIES, service.slug).toContain(url.searchParams.get('kategori'))
    }
  })
  it('maps service aliases and leaves unknown labels unselected', () => {
    expect(seoLeadPath('Google Ads')).toBe('/publicera?kategori=Digital%20marknadsf%C3%B6ring')
    expect(seoLeadPath('Apputveckling')).toBe('/publicera?kategori=App-utveckling')
    expect(seoLeadPath('seo')).toBe('/publicera?kategori=SEO')
    expect(seoLeadPath('digitala tjänster i Uppsala')).toBe('/publicera')
  })
})
