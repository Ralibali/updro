import { describe, expect, it } from 'vitest'
import { COOKIE_CONSENT_VERSION, createConsentState, parseCookieConsent, serializeCookieConsent } from '../cookieConsent'
const now = Date.parse('2026-09-30T10:00:00Z')
describe('cookie consent', () => {
  it('requires new category choices for old bundled approval', () => {
    expect(parseCookieConsent(JSON.stringify({ level: 'all', date: '2026-01-01T00:00:00.000Z' }), now)).toBeNull()
  })
  it('keeps categories separate', () => {
    expect(parseCookieConsent(serializeCookieConsent(createConsentState(true, false, '2026-09-30T09:00:00Z')), now)).toMatchObject({ analytics: true, marketing: false })
  })
  it('rejects malformed, expired, future and unknown-version choices', () => {
    for (const raw of [null, '{bad', JSON.stringify({ analytics: 'yes' }), serializeCookieConsent(createConsentState(true, true, '2025-09-30')), serializeCookieConsent(createConsentState(true, true, '2027-09-30')), JSON.stringify({ ...createConsentState(true, true, '2026-09-30'), version: 'unknown' })]) expect(parseCookieConsent(raw, now)).toBeNull()
  })
  it('serializes current version', () => { expect(JSON.parse(serializeCookieConsent(createConsentState(false, true, '2026-07-12')))).toEqual({ necessary: true, analytics: false, marketing: true, date: '2026-07-12', version: COOKIE_CONSENT_VERSION }) })
})
