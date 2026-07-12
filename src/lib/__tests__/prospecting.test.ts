import { describe, it, expect } from 'vitest'
import {
  buildProspectingQuery,
  normalizeDomain,
  isDirectoryDomain,
  pickContactPage,
  computeFitScore,
} from '../prospecting'

describe('buildProspectingQuery', () => {
  it('joins free text, need, industry and location', () => {
    const q = buildProspectingQuery({
      freeText: 'kaféer',
      needType: 'webb',
      industry: 'restaurang',
      location: 'Göteborg',
    })
    expect(q).toContain('kaféer')
    expect(q).toContain('gammal hemsida')
    expect(q).toContain('"restaurang"')
    expect(q).toContain('Göteborg')
  })

  it('omits need terms for valfritt', () => {
    const q = buildProspectingQuery({ freeText: 'x', needType: 'valfritt' })
    expect(q).toBe('x')
  })
})

describe('normalizeDomain', () => {
  it('strips www and path', () => {
    expect(normalizeDomain('https://www.Example.COM/foo?a=1')).toBe('example.com')
  })
  it('accepts bare host', () => {
    expect(normalizeDomain('sub.example.se')).toBe('sub.example.se')
  })
  it('returns null for invalid input', () => {
    expect(normalizeDomain('')).toBeNull()
    expect(normalizeDomain('not a url')).toBeNull()
  })
})

describe('isDirectoryDomain', () => {
  it('flags known directories and subdomains', () => {
    expect(isDirectoryDomain('linkedin.com')).toBe(true)
    expect(isDirectoryDomain('www.hitta.se')).toBe(true)
    expect(isDirectoryDomain('sub.allabolag.se')).toBe(true)
  })
  it('passes real domains', () => {
    expect(isDirectoryDomain('acme.se')).toBe(false)
  })
  it('treats null as directory', () => {
    expect(isDirectoryDomain(null)).toBe(true)
  })
})

describe('pickContactPage', () => {
  it('returns same-domain contact link', () => {
    const url = pickContactPage('acme.se', [
      'https://acme.se/priser',
      'https://acme.se/kontakt',
      'https://facebook.com/acme',
    ])
    expect(url).toBe('https://acme.se/kontakt')
  })
  it('accepts subdomain contact', () => {
    const url = pickContactPage('acme.se', ['https://info.acme.se/contact-us'])
    expect(url).toBe('https://info.acme.se/contact-us')
  })
  it('returns null when no contact link', () => {
    expect(pickContactPage('acme.se', ['https://acme.se/produkter'])).toBeNull()
  })
})

describe('computeFitScore', () => {
  it('is deterministic and explains signals', () => {
    const a = computeFitScore({
      needType: 'webb',
      industry: 'restaurang',
      location: 'Göteborg',
      markdown: '© 2019 Acme AB. Restaurang i Göteborg. Vår gamla hemsida.',
      contactPageUrl: 'https://acme.se/kontakt',
    })
    const b = computeFitScore({
      needType: 'webb',
      industry: 'restaurang',
      location: 'Göteborg',
      markdown: '© 2019 Acme AB. Restaurang i Göteborg. Vår gamla hemsida.',
      contactPageUrl: 'https://acme.se/kontakt',
    })
    expect(a.score).toBe(b.score)
    expect(a.score).toBeGreaterThan(60)
    expect(a.signals.length).toBeGreaterThan(2)
  })

  it('clamps to 0..100', () => {
    const r = computeFitScore({
      needType: 'webb',
      industry: 'x',
      location: 'x',
      markdown: '© 2000 x x under ombyggnad gammal hemsida',
      contactPageUrl: 'https://x.se/kontakt',
    })
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.score).toBeGreaterThanOrEqual(0)
  })

  it('gives modest base for empty markdown', () => {
    const r = computeFitScore({ needType: 'valfritt' })
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThan(50)
  })
})
