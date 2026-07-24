/**
 * Kampanj- och värvningslogik (grundarbyrå-flödet).
 *
 * Kampanjkoder ger förlängd testperiod (t.ex. GRUNDARE = 12 mån + 30 leads)
 * och valideras alltid server-side i create-account. Värvningskoder är
 * publika per byrå och ger leads till både värvare och ny byrå.
 */

/** Leads som värvaren får när en ny byrå registrerar sig via länken. */
export const REFERRAL_BONUS_CREDITS = 10

/** Extra leads som den nya byrån får när den registrerar sig via en värvningslänk. */
export const REFERRAL_NEW_SUPPLIER_BONUS = 5

const MAX_CODE_LENGTH = 32

/**
 * Normaliserar en kampanjkod: trimmar, versaler, tar bort allt utom
 * bokstäver/siffror och kortar till maxlängd. Tom sträng vid ogiltig input.
 */
export function normalizeCampaignCode(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, MAX_CODE_LENGTH)
}

/**
 * Normaliserar en värvningskod: trimmar, gemener, tar bort allt utom
 * bokstäver/siffror. Värvningskoder genereras som 8 tecken.
 */
export function normalizeReferralCode(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, MAX_CODE_LENGTH)
}

/** En kampanjkod är minst 3 tecken för att ens kunna skickas till servern. */
export function isCampaignCodeFormatValid(code: string): boolean {
  return /^[A-Z0-9]{3,32}$/.test(code)
}

/**
 * Bygger den delbara värvningslänken. Origin tas från window i webbläsaren,
 * annars faller den tillbaka på produktionsdomänen.
 */
export function buildReferralLink(code: string, origin?: string): string {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://updro.se')).replace(/\/$/, '')
  return `${base}/registrera/byra?ref=${encodeURIComponent(code)}`
}
