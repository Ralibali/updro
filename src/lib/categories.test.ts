import { describe, expect, it } from 'vitest'
import { CATEGORY_DEFINITIONS, CATEGORY_VALUES, resolveCategory, categoryLabel } from '../../supabase/functions/_shared/categories'
import { CATEGORY_NAV_LINKS } from './categoryNavLinks'
import { resolveWizardCategory } from './wizardPrefill'
import { seoLeadPath } from './seoLeadPath'
import { analyzeBriefLocally } from './briefAnalysis'
import { SEO_AGENCY_CATEGORIES } from './seoAgencyData'
import { SERVICE_CATEGORIES } from './seoCities'

it('keeps all 16 navigation categories valid from brief URL through server validation', () => {
  expect(CATEGORY_DEFINITIONS).toHaveLength(16)
  for (const { value, label, slug } of CATEGORY_DEFINITIONS) {
    expect(CATEGORY_NAV_LINKS).toContainEqual({ label, href: `/${slug}` })
    const query = new URL(seoLeadPath(label), 'https://updro.se').searchParams.get('kategori')
    expect(resolveWizardCategory(undefined, query)).toBe(value)
    expect(resolveWizardCategory(slug)).toBe(value)
    expect(CATEGORY_VALUES.has(value)).toBe(true)
    expect(categoryLabel(value)).toBe(label)
  }
})

describe('Google Ads routing', () => {
  it('keeps its own category in local analysis, public filtering and publication', () => {
    expect(analyzeBriefLocally('Vi behöver Google Ads och konverteringsspårning.').category).toBe('Google Ads')
    expect(SEO_AGENCY_CATEGORIES.find(category => category.slug === 'google-ads')?.dbCategory).toBe('Google Ads')
    expect(SERVICE_CATEGORIES.find(category => category.slug === 'google-ads')?.dbCategory).toBe('Google Ads')
    expect(resolveWizardCategory('google-ads')).toBe('Google Ads')
    expect(resolveWizardCategory(undefined, 'Google Ads')).toBe('Google Ads')
  })
  it('preserves stored legacy categories and accepts their current labels', () => {
    expect(resolveCategory('IT-support & underhåll')).toBe('Underhåll/IT Support')
    expect(resolveCategory('IT-support / Underhåll')).toBe('Underhåll/IT Support')
    expect(resolveCategory('Grafisk design & UX')).toBe('Grafisk design/UX')
    expect(resolveCategory('Webbdesign')).toBe('UX/Webbdesign')
    expect(resolveCategory('unknown')).toBe('')
  })
})
