import { describe, expect, it } from 'vitest'
import { buildCompanyIntelligence } from '../../../supabase/functions/_shared/company-intelligence'

describe('buildCompanyIntelligence', () => {
  it('extracts commercial, growth and technology signals from public company content', () => {
    const intelligence = buildCompanyIntelligence({
      markdown: `
        Välkommen till vår webbshop. Lägg i varukorg och köp online.
        Boka tid eller begär offert. Vi söker nu fler medarbetare och öppnar ny butik.
      `,
      links: ['https://cdn.shopify.com/theme.css', 'https://example.se/kontakt'],
      observedSignals: ['Publik kontaktsida hittad'],
      contactPageUrl: 'https://example.se/kontakt',
      industry: 'handel',
      location: 'Linköping',
    })

    expect(intelligence.technology_signals).toContain('Shopify')
    expect(intelligence.commercial_signals).toContain('E-handel eller direktköp')
    expect(intelligence.commercial_signals).toContain('Digital bokning')
    expect(intelligence.commercial_signals).toContain('Offert-/leadflöde')
    expect(intelligence.growth_signals).toContain('Rekryteringssignal')
    expect(intelligence.growth_signals).toContain('Expansions-/etableringssignal')
    expect(intelligence.confidence).toBeGreaterThan(50)
  })

  it('keeps weak evidence explicit instead of inventing a sales angle', () => {
    const intelligence = buildCompanyIntelligence({
      markdown: 'Välkommen till Exempel AB.',
      links: [],
      observedSignals: [],
    })

    expect(intelligence.evidence).toEqual([])
    expect(intelligence.summary).toMatch(/manuell granskning/i)
    expect(intelligence.confidence).toBe(20)
  })

  it('promotes existing deterministic site risks without collecting personal data', () => {
    const intelligence = buildCompanyIntelligence({
      markdown: '© 2021 Exempel AB',
      observedSignals: ['Gammalt copyright-år: 2021', 'Ingen tydlig CTA på den skannade sidan'],
    })

    expect(intelligence.risk_signals).toEqual([
      'Gammalt copyright-år: 2021',
      'Ingen tydlig CTA på den skannade sidan',
    ])
    expect(JSON.stringify(intelligence)).not.toMatch(/email|personnamn|telefon/i)
  })
})
