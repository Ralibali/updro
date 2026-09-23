import { describe, expect, it } from 'vitest'
import { buildProspectingQuery, computeFitScore } from './prospecting'

describe('signal-focused prospecting', () => {
  it('adds selected signal focus to the search query', () => {
    const query = buildProspectingQuery({
      freeText: '',
      needType: 'ai',
      signalFocus: 'growth',
      industry: 'redovisning',
      location: 'Sweden',
    })
    expect(query).toContain('rekryterar')
    expect(query).toContain('redovisning')
    expect(query).toContain('Sweden')
  })

  it('rewards recent explicit buying signals', () => {
    const result = computeFitScore({
      needType: 'ai',
      markdown: 'Vi söker byrå och behöver hjälp att automatisera manuellt arbete i Excel.',
      publishedAt: new Date().toISOString(),
      contactPageUrl: 'https://example.se/kontakt',
    })
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.signals.some(signal => signal.startsWith('Köpsignal:'))).toBe(true)
    expect(result.signals.some(signal => signal.startsWith('Problemsignal:'))).toBe(true)
    expect(result.signals.some(signal => signal.startsWith('Färsk källa:'))).toBe(true)
  })

  it('does not label old evidence as fresh', () => {
    const result = computeFitScore({
      needType: 'valfritt',
      markdown: 'Vi expanderar och öppnar nytt kontor.',
      publishedAt: '2020-01-01T00:00:00.000Z',
    })
    expect(result.signals.some(signal => signal.startsWith('Tillväxtsignal:'))).toBe(true)
    expect(result.signals.some(signal => signal.startsWith('Färsk källa:'))).toBe(false)
  })
})
