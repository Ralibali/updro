import { describe, expect, it } from 'vitest'
import { CATEGORIES, CATEGORY_BY_SLUG } from '@/lib/constants'
import {
  descriptionHelpMessage,
  PROJECT_DESCRIPTION_EXAMPLE,
  resolveWizardCategory,
} from '@/lib/wizardPrefill'

describe('PROJECT_DESCRIPTION_EXAMPLE', () => {
  it('är ett konkret uppdragsexempel, inte minst-tecken-kravet', () => {
    expect(PROJECT_DESCRIPTION_EXAMPLE).toBe(
      'T.ex. Ny företagssajt, ca 10 sidor, bokning och koppling till vårt CRM.',
    )
    expect(PROJECT_DESCRIPTION_EXAMPLE).not.toMatch(/minst 10 tecken/i)
  })
})

describe('descriptionHelpMessage', () => {
  it('visar exempeltexten när fältet är tomt', () => {
    expect(descriptionHelpMessage(0)).toBe(PROJECT_DESCRIPTION_EXAMPLE)
    expect(descriptionHelpMessage(0)).not.toMatch(/minst 10 tecken/i)
  })

  it('behåller teckenräkning när användaren har börjat skriva', () => {
    expect(descriptionHelpMessage(4)).toBe('4 / minst 10 tecken rekommenderas för bra matchning')
  })

  it('behåller uppmuntran när minimum är nått', () => {
    expect(descriptionHelpMessage(10)).toBe('Toppen – nu har byråer ett bra underlag.')
    expect(descriptionHelpMessage(40)).toBe('Bra! Detaljerade uppdrag får fler relevanta offerter.')
  })
})

describe('resolveWizardCategory', () => {
  it('mappar /publicera/webbutveckling till Webbutveckling', () => {
    expect(resolveWizardCategory('webbutveckling')).toBe('Webbutveckling')
  })

  it('mappar kända hero-slugs via CATEGORY_BY_SLUG', () => {
    expect(resolveWizardCategory('ehandel')).toBe('E-handel')
    expect(resolveWizardCategory('seo')).toBe('SEO')
    expect(resolveWizardCategory('digital-marknadsforing')).toBe('Digital marknadsföring')
    expect(resolveWizardCategory('apputveckling')).toBe('App-utveckling')
    expect(resolveWizardCategory('ai-utveckling')).toBe('AI-utveckling')
  })

  it('är case-insensitive för sökvägs-slug', () => {
    expect(resolveWizardCategory('Webbutveckling')).toBe('Webbutveckling')
    expect(resolveWizardCategory('E-HANDEL')).toBe('E-handel')
  })

  it('behåller befintlig ?kategori= (exakt kategorinamn)', () => {
    expect(resolveWizardCategory(undefined, 'SEO')).toBe('SEO')
    expect(resolveWizardCategory('', 'Webbutveckling')).toBe('Webbutveckling')
    expect(resolveWizardCategory(null, 'Digital marknadsföring')).toBe('Digital marknadsföring')
  })

  it('låter query-param vinna över sökväg så ?kategori= fortsätter fungera', () => {
    expect(resolveWizardCategory('webbutveckling', 'SEO')).toBe('SEO')
  })

  it('faller tillbaka till sökväg när query-param inte är ett giltigt namn', () => {
    expect(resolveWizardCategory('webbutveckling', 'webbutveckling')).toBe('Webbutveckling')
    expect(resolveWizardCategory('seo', 'okänd')).toBe('SEO')
  })

  it('returnerar tomt för okänd slug eller tom input', () => {
    expect(resolveWizardCategory('okand-kategori')).toBe('')
    expect(resolveWizardCategory(undefined, 'okänd')).toBe('')
    expect(resolveWizardCategory('', '')).toBe('')
    expect(resolveWizardCategory(null, null)).toBe('')
  })

  it('mappar bara till kategorier som finns i CATEGORIES', () => {
    for (const [slug, name] of Object.entries(CATEGORY_BY_SLUG)) {
      expect(CATEGORIES, slug).toContain(name)
      expect(resolveWizardCategory(slug)).toBe(name)
    }
  })
})
