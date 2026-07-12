/**
 * First-touch and latest-touch attribution capture.
 *
 * - First-touch is stored in localStorage on the very first qualifying page
 *   view and is NEVER overwritten (survives sessions).
 * - Latest-touch is updated whenever the visitor arrives with UTM parameters
 *   or from a new external referrer host.
 *
 * All helpers are SSR/test safe: they no-op when `window` / `localStorage`
 * are unavailable and accept explicit inputs for unit testing.
 */

export type Touch = {
  source: string | null
  medium: string | null
  campaign: string | null
  term: string | null
  content: string | null
  landing_path: string | null
  referrer: string | null
  timestamp: string
}

export type Attribution = {
  first: Touch | null
  latest: Touch | null
}

export const FIRST_TOUCH_KEY = 'updro:attribution:first'
export const LATEST_TOUCH_KEY = 'updro:attribution:latest'

const clean = (value: string | null | undefined, max = 200): string | null => {
  if (!value) return null
  const trimmed = value.trim().slice(0, max)
  return trimmed.length ? trimmed : null
}

const sameOrigin = (referrer: string, origin: string): boolean => {
  if (!referrer) return true
  try {
    return new URL(referrer).origin === origin
  } catch {
    return true
  }
}

const hostOf = (referrer: string | null): string | null => {
  if (!referrer) return null
  try {
    return new URL(referrer).host
  } catch {
    return null
  }
}

export type BuildTouchInput = {
  search: string
  pathname: string
  referrer: string
  origin: string
  now?: Date
}

/** Build a Touch from the current page context, or null for pure organic same-site. */
export const buildTouch = ({ search, pathname, referrer, origin, now }: BuildTouchInput): Touch | null => {
  const params = new URLSearchParams(search)
  const source = clean(params.get('utm_source'))
  const medium = clean(params.get('utm_medium'))
  const campaign = clean(params.get('utm_campaign'))
  const term = clean(params.get('utm_term'))
  const content = clean(params.get('utm_content'))
  const externalReferrer = referrer && !sameOrigin(referrer, origin) ? clean(referrer, 500) : null
  if (!source && !medium && !campaign && !term && !content && !externalReferrer) return null

  return {
    source: source ?? (externalReferrer ? 'referral' : null),
    medium: medium ?? (externalReferrer ? 'referral' : null),
    campaign,
    term,
    content,
    landing_path: clean(pathname, 300),
    referrer: externalReferrer,
    timestamp: (now ?? new Date()).toISOString(),
  }
}

export const touchesDiffer = (a: Touch | null, b: Touch | null): boolean => {
  if (!a || !b) return Boolean(a) !== Boolean(b)
  return (
    a.source !== b.source ||
    a.medium !== b.medium ||
    a.campaign !== b.campaign ||
    a.term !== b.term ||
    a.content !== b.content ||
    hostOf(a.referrer) !== hostOf(b.referrer)
  )
}

/** Safe JSON parse for stored touch. Returns null on bad shape. */
export const parseStoredTouch = (raw: string | null): Touch | null => {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object') return null
    const t = value as Record<string, unknown>
    const str = (v: unknown): string | null => (typeof v === 'string' ? v : null)
    const timestamp = str(t.timestamp)
    if (!timestamp) return null
    return {
      source: str(t.source),
      medium: str(t.medium),
      campaign: str(t.campaign),
      term: str(t.term),
      content: str(t.content),
      landing_path: str(t.landing_path),
      referrer: str(t.referrer),
      timestamp,
    }
  } catch {
    return null
  }
}

const readStored = (key: string): Touch | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    return parseStoredTouch(localStorage.getItem(key))
  } catch {
    return null
  }
}

const writeStored = (key: string, touch: Touch): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(touch))
  } catch {
    /* ignore quota errors */
  }
}

/** Pure reducer used by capture + tests. */
export const reduceAttribution = (stored: Attribution, incoming: Touch | null): Attribution => {
  if (!incoming) return stored
  const first = stored.first ?? incoming
  const latest = touchesDiffer(stored.latest, incoming) ? incoming : (stored.latest ?? incoming)
  return { first, latest }
}

export const captureFromLocation = (location: { search: string; pathname: string }): Attribution => {
  if (typeof window === 'undefined') return { first: null, latest: null }

  const touch = buildTouch({
    search: location.search,
    pathname: location.pathname,
    referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
    origin: window.location.origin,
  })

  const stored: Attribution = {
    first: readStored(FIRST_TOUCH_KEY),
    latest: readStored(LATEST_TOUCH_KEY),
  }

  const next = reduceAttribution(stored, touch)
  if (next.first && !stored.first) writeStored(FIRST_TOUCH_KEY, next.first)
  if (next.latest && next.latest !== stored.latest) writeStored(LATEST_TOUCH_KEY, next.latest)
  return next
}

export const getStoredAttribution = (): Attribution => ({
  first: readStored(FIRST_TOUCH_KEY),
  latest: readStored(LATEST_TOUCH_KEY),
})

/** Serialize both touches into the payload sent when a project is submitted. */
export const attributionPayload = (attribution: Attribution = getStoredAttribution()) => ({
  first_touch: attribution.first,
  latest_touch: attribution.latest,
})

/** Idempotent init — called once from main.tsx at app boot. Safe under SSR. */
export const initAttribution = (): Attribution => {
  if (typeof window === 'undefined') return { first: null, latest: null }
  return captureFromLocation({ search: window.location.search, pathname: window.location.pathname })
}
