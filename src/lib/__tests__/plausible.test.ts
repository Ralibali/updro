import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetPlausibleStateForTests,
  isTrackablePath,
  sanitizePlausibleProps,
  trackPlausibleEvent,
  trackPlausiblePageview,
} from '@/lib/plausible'

type PlausibleCall = [string, unknown?]

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void
  }
}

const setupPlausibleSpy = () => {
  const calls: PlausibleCall[] = []
  window.plausible = ((event: string, options?: unknown) => {
    calls.push([event, options])
  }) as unknown as Window['plausible']
  return calls
}

describe('sanitizePlausibleProps', () => {
  it('keeps allowlisted low-cardinality keys', () => {
    expect(sanitizePlausibleProps({ category: 'seo', plan: 'monthly', billing_interval: 'monthly', source: 'hero', user_type: 'buyer' })).toEqual({
      category: 'seo', plan: 'monthly', billing_interval: 'monthly', source: 'hero', user_type: 'buyer',
    })
  })

  it('drops emails, urls, uuids and overly long values', () => {
    expect(sanitizePlausibleProps({ source: 'user@example.com' })).toBeUndefined()
    expect(sanitizePlausibleProps({ source: 'https://updro.se' })).toBeUndefined()
    expect(sanitizePlausibleProps({ source: '550e8400-e29b-41d4-a716-446655440000' })).toBeUndefined()
    expect(sanitizePlausibleProps({ source: 'x'.repeat(100) })).toBeUndefined()
  })

  it('drops unknown / non-allowlisted keys', () => {
    const dirty = { category: 'seo', email: 'a@b.se', title: 'Min brief' } as unknown as Parameters<typeof sanitizePlausibleProps>[0]
    expect(sanitizePlausibleProps(dirty)).toEqual({ category: 'seo' })
  })
})

describe('isTrackablePath', () => {
  it('skips admin and dashboard routes', () => {
    expect(isTrackablePath('/admin')).toBe(false)
    expect(isTrackablePath('/admin/prospektering')).toBe(false)
    expect(isTrackablePath('/dashboard/supplier/uppdrag/123')).toBe(false)
  })
  it('allows public routes', () => {
    expect(isTrackablePath('/')).toBe(true)
    expect(isTrackablePath('/publicera')).toBe(true)
  })
})

describe('trackPlausiblePageview', () => {
  beforeEach(() => { __resetPlausibleStateForTests() })
  afterEach(() => { delete window.plausible })

  it('skips the initial pageview to avoid double count with plausible.init()', () => {
    const calls = setupPlausibleSpy()
    expect(trackPlausiblePageview('/')).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('sends subsequent pageviews without query strings', () => {
    const calls = setupPlausibleSpy()
    trackPlausiblePageview('/') // skipped
    expect(trackPlausiblePageview('/publicera')).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0][0]).toBe('pageview')
    const opts = calls[0][1] as { u?: string }
    expect(opts.u).toMatch(/\/publicera$/)
    expect(opts.u).not.toContain('?')
  })

  it('never fires for sensitive paths', () => {
    const calls = setupPlausibleSpy()
    trackPlausiblePageview('/') // skipped
    expect(trackPlausiblePageview('/admin/settings')).toBe(false)
    expect(calls).toHaveLength(0)
  })
})

describe('trackPlausibleEvent', () => {
  afterEach(() => { delete window.plausible; vi.restoreAllMocks() })

  it('sends allowlisted props only', () => {
    const calls = setupPlausibleSpy()
    trackPlausibleEvent('Offer Submitted', { category: 'SEO', plan: 'monthly' })
    expect(calls).toEqual([['Offer Submitted', { props: { category: 'SEO', plan: 'monthly' } }]])
  })

  it('drops PII-shaped values before sending', () => {
    const calls = setupPlausibleSpy()
    trackPlausibleEvent('Uppdrag Submitted', { category: 'SEO', source: 'buyer@x.se' })
    expect(calls[0]).toEqual(['Uppdrag Submitted', { props: { category: 'SEO' } }])
  })

  it('is a no-op when plausible is not on window', () => {
    expect(trackPlausibleEvent('Uppdrag Started', { source: 'hero' })).toBe(false)
  })
})
