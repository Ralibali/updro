import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackLeadStarted, trackLeadSubmitted } from '@/lib/analytics'
import { COOKIE_CONSENT_KEY, createConsentState, serializeCookieConsent } from '@/lib/cookieConsent'

const lead = { source: 'publicera', category: 'Webbutveckling', userType: 'guest' as const }

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.gtag = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
  delete window.gtag
  localStorage.clear()
  sessionStorage.clear()
})

describe('Google Ads completed lead conversion', () => {
  it.each([null, '{invalid', serializeCookieConsent(createConsentState(true, false))])('does not send an Ads conversion without marketing consent (%s)', stored => {
    if (stored) localStorage.setItem(COOKIE_CONSENT_KEY, stored)
    trackLeadSubmitted(lead)
    expect(window.gtag).not.toHaveBeenCalledWith('event', 'conversion', expect.anything())
  })

  it('sends only the verified destination after marketing consent, without contact details or invented revenue', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, serializeCookieConsent(createConsentState(false, true)))
    trackLeadSubmitted(lead)
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-10941540384/FJsSCP7vrd0cEKDQquEo',
    })
  })

  it('does not treat starting a request as a completed conversion', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, serializeCookieConsent(createConsentState(true, true)))
    trackLeadStarted('project_wizard')
    expect(window.gtag).not.toHaveBeenCalledWith('event', 'conversion', expect.anything())
  })

  it('keeps the successful submission safe when consent storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    expect(() => trackLeadSubmitted(lead)).not.toThrow()
    expect(window.gtag).not.toHaveBeenCalledWith('event', 'conversion', expect.anything())
  })
})
