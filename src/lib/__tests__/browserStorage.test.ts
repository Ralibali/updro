import { afterEach, describe, expect, it, vi } from 'vitest'
import { readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage'
import { trackOnceInSession, trackLeadSubmitted } from '@/lib/analytics'

afterEach(() => {
  vi.restoreAllMocks()
  delete window.gtag
  delete window.plausible
})

describe('optional storage and analytics', () => {
  it('survives a denied storage getter and quota errors', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('SecurityError') })
    expect(readBrowserStorage('localStorage', 'test')).toBeNull()
    expect(writeBrowserStorage('localStorage', 'test', 'value')).toBe(false)
    expect(() => removeBrowserStorage('localStorage', 'test')).not.toThrow()
  })

  it('still deduplicates within the page when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    const event = vi.fn()
    expect(trackOnceInSession('storage-blocked-test', event)).toBe(true)
    expect(trackOnceInSession('storage-blocked-test', event)).toBe(false)
    expect(event).toHaveBeenCalledTimes(1)
  })

  it('never turns a saved lead into a UI failure when analytics throws', () => {
    window.gtag = () => { throw new Error('gtag unavailable') }
    window.plausible = () => { throw new Error('plausible unavailable') }
    expect(() => trackLeadSubmitted({ source: 'publicera', category: 'SEO', userType: 'guest' })).not.toThrow()
  })
})
