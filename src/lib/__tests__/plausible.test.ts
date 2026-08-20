import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PLAUSIBLE_EVENT_NAMES,
  __resetPlausibleStateForTests,
  buildPlausiblePageviewUrl,
  isTrackablePath,
  projectValueSegment,
  sanitizePlausibleProps,
  trackPlausibleEvent,
  trackPlausiblePageview,
  type PlausibleEventName,
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
    expect(sanitizePlausibleProps({
      category: 'seo',
      city: 'Göteborg',
      landing_page: '/publicera',
      acquisition_channel: 'google',
      campaign: 'brand',
      plan: 'monthly',
      billing_interval: 'monthly',
      pricing_model: 'monthly',
      project_value_segment: '10k_50k',
      source: 'hero',
      user_type: 'buyer',
    })).toEqual({
      category: 'seo',
      city: 'Göteborg',
      landing_page: '/publicera',
      acquisition_channel: 'google',
      campaign: 'brand',
      plan: 'monthly',
      billing_interval: 'monthly',
      pricing_model: 'monthly',
      project_value_segment: '10k_50k',
      source: 'hero',
      user_type: 'buyer',
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

  it('rejects landing_page that is not a public path-only value', () => {
    expect(sanitizePlausibleProps({ landing_page: 'https://updro.se/publicera' })).toBeUndefined()
    expect(sanitizePlausibleProps({ landing_page: '/publicera?beskrivning=hemlig' })).toBeUndefined()
    expect(sanitizePlausibleProps({ landing_page: '/admin' })).toBeUndefined()
    expect(sanitizePlausibleProps({ landing_page: '/dashboard/supplier' })).toBeUndefined()
    expect(sanitizePlausibleProps({ city: 'user@byra.se' })).toBeUndefined()
  })
})

describe('isTrackablePath', () => {
  it('skips admin and dashboard routes on hard load and subpaths', () => {
    expect(isTrackablePath('/admin')).toBe(false)
    expect(isTrackablePath('/admin/')).toBe(false)
    expect(isTrackablePath('/admin/prospektering')).toBe(false)
    expect(isTrackablePath('/admin/uppdrag?id=1')).toBe(false)
    expect(isTrackablePath('/dashboard')).toBe(false)
    expect(isTrackablePath('/dashboard/supplier')).toBe(false)
    expect(isTrackablePath('/dashboard/supplier/uppdrag/123')).toBe(false)
    expect(isTrackablePath('/dashboard/buyer/uppdrag/abc')).toBe(false)
  })
  it('allows public marketing and wizard routes', () => {
    expect(isTrackablePath('/')).toBe(true)
    expect(isTrackablePath('/publicera')).toBe(true)
    expect(isTrackablePath('/publicera/webbutveckling')).toBe(true)
    expect(isTrackablePath('/registrera/byra')).toBe(true)
    expect(isTrackablePath('/for-byraer')).toBe(true)
  })
  it('does not treat similarly prefixed public paths as admin', () => {
    expect(isTrackablePath('/administrator')).toBe(true)
  })
})

describe('projectValueSegment', () => {
  it('maps known budget ranges and falls back to unknown', () => {
    expect(projectValueSegment('under_10k')).toBe('under_10k')
    expect(projectValueSegment('10k_50k')).toBe('10k_50k')
    expect(projectValueSegment('50k_150k')).toBe('50k_150k')
    expect(projectValueSegment('over_150k')).toBe('over_150k')
    expect(projectValueSegment('unknown')).toBe('unknown')
    expect(projectValueSegment('not-a-budget')).toBe('unknown')
    expect(projectValueSegment()).toBe('unknown')
  })
})

describe('buildPlausiblePageviewUrl', () => {
  it('keeps only attribution query keys and drops briefs', () => {
    expect(buildPlausiblePageviewUrl(
      'https://updro.se',
      '/publicera',
      '?utm_source=google&utm_campaign=brand&beskrivning=hemlig-brief',
    )).toBe('https://updro.se/publicera?utm_source=google&utm_campaign=brand')
  })
})

describe('trackPlausiblePageview', () => {
  beforeEach(() => { __resetPlausibleStateForTests() })
  afterEach(() => { delete window.plausible })

  it('sends the first public pageview because snippet auto-capture is off', () => {
    const calls = setupPlausibleSpy()
    expect(trackPlausiblePageview('/')).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0][0]).toBe('pageview')
  })

  it('sends subsequent pageviews without leaking non-attribution query strings', () => {
    const calls = setupPlausibleSpy()
    expect(trackPlausiblePageview('/')).toBe(true)
    expect(trackPlausiblePageview('/publicera')).toBe(true)
    expect(calls).toHaveLength(2)
    expect(calls[1][0]).toBe('pageview')
    const opts = calls[1][1] as { u?: string }
    expect(opts.u).toMatch(/\/publicera$/)
    expect(opts.u).not.toContain('beskrivning')
  })

  it('never fires for /admin or /dashboard, including the first hard-load pageview', () => {
    const calls = setupPlausibleSpy()
    expect(trackPlausiblePageview('/admin')).toBe(false)
    expect(trackPlausiblePageview('/admin/settings')).toBe(false)
    expect(trackPlausiblePageview('/dashboard')).toBe(false)
    expect(trackPlausiblePageview('/dashboard/supplier/uppdrag')).toBe(false)
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

  it('accepts every locked funnel event name exactly once per call', () => {
    const calls = setupPlausibleSpy()
    for (const name of PLAUSIBLE_EVENT_NAMES) {
      expect(trackPlausibleEvent(name as PlausibleEventName)).toBe(true)
    }
    expect(calls.map(call => call[0])).toEqual([...PLAUSIBLE_EVENT_NAMES])
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Category Selected')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Uppdrag Details Completed')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Uppdrag Qualified')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('First Offer Received')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Agency Selected')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Agency Signup Started')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Lead Viewed')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Lead Unlock Started')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Lead Purchase Completed')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Uppdrag Started')
    expect(PLAUSIBLE_EVENT_NAMES).toContain('Uppdrag Submitted')
  })
})

describe('Plausible snippet constraints', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

  it('disables auto form submissions and auto pageviews so Form: Submission and hard-load /admin are not recorded', () => {
    expect(html).toMatch(/formSubmissions:\s*false/)
    expect(html).toMatch(/autoCapturePageviews:\s*false/)
    expect(html).toMatch(/isSensitivePlausiblePath/)
    expect(html).toMatch(/payload\.n === 'pageview'/)
  })
})
