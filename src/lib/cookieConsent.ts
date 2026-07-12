export const COOKIE_CONSENT_KEY = 'updro_cookie_consent'
export const COOKIE_CONSENT_VERSION = '2026-07-12'

export type CookieConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
  date: string
  version: string
}

type LegacyConsent = { level?: 'all' | 'necessary'; date?: string }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export const createConsentState = (analytics: boolean, marketing: boolean, date = new Date().toISOString()): CookieConsentState => ({ necessary: true, analytics, marketing, date, version: COOKIE_CONSENT_VERSION })

export const parseCookieConsent = (raw: string | null): CookieConsentState | null => {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
      return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing, date: typeof parsed.date === 'string' ? parsed.date : new Date().toISOString(), version: typeof parsed.version === 'string' ? parsed.version : COOKIE_CONSENT_VERSION }
    }
    const legacy = parsed as LegacyConsent
    if (legacy.level === 'all') return createConsentState(true, true, legacy.date)
    if (legacy.level === 'necessary') return createConsentState(false, false, legacy.date)
  } catch { return null }
  return null
}

export const serializeCookieConsent = (state: CookieConsentState): string => JSON.stringify({ ...state, necessary: true, version: COOKIE_CONSENT_VERSION })
