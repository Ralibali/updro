import { describe, expect, it } from 'vitest'
import { COOKIE_CONSENT_VERSION, createConsentState, parseCookieConsent, serializeCookieConsent } from '../cookieConsent'

describe('cookie consent', () => {
  it('migrates legacy all consent', () => {
    expect(parseCookieConsent(JSON.stringify({ level: 'all', date: '2026-01-01T00:00:00.000Z' }))).toEqual({ necessary: true, analytics: true, marketing: true, date: '2026-01-01T00:00:00.000Z', version: COOKIE_CONSENT_VERSION })
  })
  it('migrates legacy necessary consent', () => {
    const state = parseCookieConsent(JSON.stringify({ level: 'necessary' }))
    expect(state?.analytics).toBe(false)
    expect(state?.marketing).toBe(false)
  })
  it('keeps categories separate', () => {
    const state = parseCookieConsent(JSON.stringify({ necessary: true, analytics: true, marketing: false, date: '2026-07-12', version: COOKIE_CONSENT_VERSION }))
    expect(state?.analytics).toBe(true)
    expect(state?.marketing).toBe(false)
  })
  it('rejects invalid data', () => {
    expect(parseCookieConsent(null)).toBeNull()
    expect(parseCookieConsent('{bad')).toBeNull()
    expect(parseCookieConsent(JSON.stringify({ analytics: 'yes' }))).toBeNull()
  })
  it('serializes current version', () => {
    expect(JSON.parse(serializeCookieConsent(createConsentState(false, true, '2026-07-12')))).toEqual({ necessary: true, analytics: false, marketing: true, date: '2026-07-12', version: COOKIE_CONSENT_VERSION })
  })
})
