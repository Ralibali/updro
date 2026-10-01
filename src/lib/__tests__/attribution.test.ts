import { COOKIE_CONSENT_KEY, createConsentState } from '../cookieConsent'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildTouch,
  reduceAttribution,
  touchesDiffer,
  captureFromLocation,
  FIRST_TOUCH_KEY,
  LATEST_TOUCH_KEY,
  attributionPayload,
  type Touch,
} from '@/lib/attribution'

const t = (overrides: Partial<Touch> = {}): Touch => ({
  source: 'google',
  medium: 'cpc',
  campaign: 'brand',
  term: null,
  content: null,
  landing_path: '/publicera',
  referrer: null,
  timestamp: '2026-07-12T00:00:00.000Z',
  ...overrides,
})

describe('buildTouch', () => {
  it('returns null for organic same-origin navigation', () => {
    const result = buildTouch({ search: '', pathname: '/', referrer: 'https://updro.se/', origin: 'https://updro.se' })
    expect(result).toBeNull()
  })
  it('captures UTM parameters', () => {
    const result = buildTouch({
      search: '?utm_source=google&utm_medium=cpc&utm_campaign=brand&utm_term=byrå&utm_content=hero',
      pathname: '/publicera',
      referrer: '',
      origin: 'https://updro.se',
    })
    expect(result).toMatchObject({
      source: 'google', medium: 'cpc', campaign: 'brand', term: 'byrå', content: 'hero',
      landing_path: '/publicera', referrer: null,
    })
  })
  it('records external referrer even without UTM params', () => {
    const result = buildTouch({
      search: '',
      pathname: '/publicera',
      referrer: 'https://news.example.com/article',
      origin: 'https://updro.se',
    })
    expect(result?.source).toBe('referral')
    expect(result?.referrer).toBe('https://news.example.com')
  })
})

describe('reduceAttribution', () => {
  it('first-touch is preserved and latest-touch updates when campaign changes', () => {
    const first = t({ source: 'facebook', campaign: 'launch' })
    const initial = reduceAttribution({ first: null, latest: null }, first)
    expect(initial.first).toEqual(first)
    expect(initial.latest).toEqual(first)

    const later = t({ source: 'google', campaign: 'brand' })
    const next = reduceAttribution(initial, later)
    expect(next.first).toEqual(first)
    expect(next.latest).toEqual(later)
  })
  it('does not overwrite latest when incoming touch equals current', () => {
    const only = t()
    const state = reduceAttribution({ first: only, latest: only }, t({ timestamp: 'ignored' }))
    expect(state.latest).toBe(only)
  })
})

describe('touchesDiffer', () => {
  it('treats different referrer hosts as new touches', () => {
    expect(touchesDiffer(t({ referrer: 'https://a.com/x' }), t({ referrer: 'https://b.com/y' }))).toBe(true)
    expect(touchesDiffer(t({ referrer: 'https://a.com/x' }), t({ referrer: 'https://a.com/y' }))).toBe(false)
  })
})

describe('captureFromLocation + serialization', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(false, true)))
    Object.defineProperty(document, 'referrer', { value: '', configurable: true })
  })
  it('blocks capture and submission before consent or after withdrawal', () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    expect(captureFromLocation({ search: '?utm_source=google', pathname: '/publicera' })).toEqual({ first: null, latest: null })
    expect(localStorage.getItem(FIRST_TOUCH_KEY)).toBeNull()
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(false, true)))
    const captured = captureFromLocation({ search: '?utm_source=google', pathname: '/publicera' })
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(true, false)))
    expect(attributionPayload(captured)).toEqual({ first_touch: null, latest_touch: null })
    captureFromLocation({ search: '', pathname: '/' })
    expect(localStorage.getItem(FIRST_TOUCH_KEY)).toBeNull()
  })
  it('drops referrer queries and unsafe campaign values', () => {
    const result = buildTouch({ search: '?utm_source=google&utm_campaign=private%40example.test', pathname: '/', referrer: 'https://news.test/read?email=private@example.test', origin: 'https://updro.se' })
    expect(result?.referrer).toBe('https://news.test')
    expect(result?.campaign).toBeNull()
  })
  it('replaces expired attribution', () => {
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(t({ timestamp: '2020-01-01T00:00:00Z' })))
    expect(captureFromLocation({ search: '?utm_source=new', pathname: '/' }).first?.source).toBe('new')
  })
  it('persists first-touch across sessions and refreshes latest', () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true })
    const first = captureFromLocation({ search: '?utm_source=facebook&utm_medium=paid', pathname: '/publicera' })
    expect(first.first?.source).toBe('facebook')
    expect(localStorage.getItem(FIRST_TOUCH_KEY)).toContain('facebook')

    const second = captureFromLocation({ search: '?utm_source=google&utm_medium=cpc', pathname: '/publicera' })
    expect(second.first?.source).toBe('facebook') // first-touch immutable
    expect(second.latest?.source).toBe('google')
    expect(localStorage.getItem(LATEST_TOUCH_KEY)).toContain('google')
  })
  it('serializes to payload for the submitted project', () => {
    captureFromLocation({ search: '?utm_source=newsletter&utm_medium=email&utm_campaign=july', pathname: '/publicera' })
    const payload = attributionPayload()
    expect(payload.first_touch?.source).toBe('newsletter')
    expect(payload.latest_touch?.campaign).toBe('july')
  })
})
