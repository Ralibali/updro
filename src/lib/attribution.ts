/**
 * First-touch and latest-touch attribution capture.
 *
 * - First-touch is stored in localStorage on the very first qualifying page
 *   view and is NEVER overwritten (survives sessions).
 * - Latest-touch is updated whenever the visitor arrives with UTM parameters
 *   or from a new external referrer.
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
    const url = new URL(referrer)
    return url.origin === origin
  } catch {
    return true
  }
}

const referrerHost = (referrer: string | null): string | null => {
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

/**
 * Build a Touch from the current page context. Returns null when the visit
 * has no UTM params and no external referrer (pure organic same-site nav).
 */
export const buildTouch = ({ search, pathname, referrer, origin, now }: BuildTouchInput): Touch | null => {
  const params = new URLSearchParams(search)
  const source = clean(params.get('utm_source'))
  const medium = clean(params.get('utm_medium'))
  const campaign = clean(params.get('utm_campaign'))
  const term = clean(params.get('utm_term'))
  const content = clean(params.get('utm_content'))
  const externalReferrer = referrer && !sameOrigin(referrer, origin) ? clean(referrer, 500) : null

  const hasSignal = Boolean(source || medium || campaign || term || content || externalReferrer)
  if (!hasSignal) return null

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
    referrerHost(a.referrer) !== referrerHost(b.referrer)
  )
}

const readStored = (key: string): Touch | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as Touch
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

/**
 * Pure reducer used by the capture hook and tests: given the currently stored
 * touches and a fresh touch, decide what should be persisted.
 */
export const reduceAttribution = (
  stored: Attribution,
  incoming: Touch | null,
): Attribution => {
  if (!incoming) return stored
  const first = stored.first ?? incoming
  const latest = touchesDiffer(stored.latest, incoming) ? incoming : (stored.latest ?? incoming)
  return { first, latest }
}

export const captureFromLocation = (location: {
  search: string
  pathname: string
}): Attribution => {
  if (typeof window === 'undefined') return { first: null, latest: null }

  const touch = buildTouch({
    search: location.search,
    pathname: location.pathname,
    referrer: document.referrer || '',
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
