export const COOKIE_CONSENT_KEY = 'updro_cookie_consent'
export const COOKIE_CONSENT_VERSION = '2026-07-12'

export type CookieConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
  date: string
  version: string
}

const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export const createConsentState = (analytics: boolean, marketing: boolean, date = new Date().toISOString()): CookieConsentState => ({ necessary: true, analytics, marketing, date, version: COOKIE_CONSENT_VERSION })

export const parseCookieConsent = (raw: string | null, now = Date.now()): CookieConsentState | null => {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const timestamp = typeof parsed.date === 'string' ? Date.parse(parsed.date) : NaN
    if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp >= CONSENT_MAX_AGE_MS) return null
    if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
      if (parsed.version !== COOKIE_CONSENT_VERSION) return null
      return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing, date: parsed.date as string, version: COOKIE_CONSENT_VERSION }
    }
    // Old bundled choices do not establish separate, current category choices.
    if (parsed.level === 'necessary') return createConsentState(false, false, parsed.date as string)
  } catch { return null }
  return null
}

export const serializeCookieConsent = (state: CookieConsentState): string => JSON.stringify({ ...state, necessary: true, version: COOKIE_CONSENT_VERSION })
