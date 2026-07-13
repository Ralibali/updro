/**
 * Typed Plausible Analytics helper.
 *
 * The Plausible script itself is loaded once from index.html. This module only
 * pushes events into the global `plausible()` queue. It is safe to call before
 * the script has finished loading — Plausible's own snippet defines a queue
 * (`plausible.q`) that flushes on load.
 *
 * Strict privacy rules enforced here:
 *   - Only low-cardinality, non-identifying property values are accepted.
 *   - Event names are a fixed union — no free-form names from call sites.
 *   - Pageviews are stripped of query strings so that briefs, tokens or any
 *     other data accidentally present in the URL never reach Plausible.
 */

export type PlausibleEventName =
  | 'Brief Started'
  | 'Brief Submitted'
  | 'Agency Signup Completed'
  | 'Offer Submitted'
  | 'Lead Unlocked'
  | 'Subscription Checkout Started'
  | 'Subscription Purchased'

export type PlausibleUserType = 'guest' | 'buyer' | 'supplier'
export type PlausibleBillingInterval = 'one_time' | 'monthly' | 'yearly'
export type PlausiblePlan = 'lead' | 'monthly' | 'yearly' | 'trial' | 'standard' | 'premium'

/**
 * Low-cardinality property allowlist. Anything not on this list is dropped so
 * that call sites cannot accidentally send PII (email, company name, brief
 * title, internal ids, etc.).
 */
export interface PlausibleProps {
  category?: string
  plan?: PlausiblePlan | string
  billing_interval?: PlausibleBillingInterval
  source?: string
  user_type?: PlausibleUserType
}

const ALLOWED_KEYS: readonly (keyof PlausibleProps)[] = [
  'category',
  'plan',
  'billing_interval',
  'source',
  'user_type',
]

// Reject anything that looks like an email, url, uuid, long token or free text.
const MAX_VALUE_LEN = 40
const EMAIL_RE = /@/
const URL_RE = /^https?:\/\//i
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export const sanitizePlausibleProps = (props?: PlausibleProps): Record<string, string> | undefined => {
  if (!props) return undefined
  const out: Record<string, string> = {}
  for (const key of ALLOWED_KEYS) {
    const raw = props[key]
    if (raw == null) continue
    const value = String(raw).trim()
    if (!value) continue
    if (value.length > MAX_VALUE_LEN) continue
    if (EMAIL_RE.test(value) || URL_RE.test(value) || UUID_RE.test(value)) continue
    out[key] = value
  }
  return Object.keys(out).length > 0 ? out : undefined
}

// Paths on which we never send pageviews or events — admin surfaces and other
// authenticated dashboards can contain buyer names, project titles etc. in the
// document.title. Plausible does not read the title but we still avoid noise.
const SENSITIVE_PATH_PREFIXES = ['/admin', '/dashboard']

export const isTrackablePath = (path: string): boolean => {
  return !SENSITIVE_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}

type PlausibleFn = (
  event: string,
  options?: { u?: string; props?: Record<string, string>; callback?: () => void },
) => void

const getPlausible = (): PlausibleFn | null => {
  if (typeof window === 'undefined') return null
  const fn = (window as unknown as { plausible?: PlausibleFn }).plausible
  return typeof fn === 'function' ? fn : null
}

/**
 * Skip the very first pageview after page load. The Plausible snippet's
 * `plausible.init()` call in index.html already records the initial pageview,
 * so counting it again from the SPA hook would double the number.
 */
let initialPageviewSkipped = false

/** Test-only reset. */
export const __resetPlausibleStateForTests = () => {
  initialPageviewSkipped = false
}

export const trackPlausiblePageview = (path: string): boolean => {
  if (typeof window === 'undefined') return false
  if (!isTrackablePath(path)) return false
  if (!initialPageviewSkipped) {
    initialPageviewSkipped = true
    return false
  }
  const plausible = getPlausible()
  if (!plausible) return false
  const url = `${window.location.origin}${path}`
  plausible('pageview', { u: url })
  return true
}

export const trackPlausibleEvent = (name: PlausibleEventName, props?: PlausibleProps): boolean => {
  if (typeof window === 'undefined') return false
  const plausible = getPlausible()
  if (!plausible) return false
  const safeProps = sanitizePlausibleProps(props)
  plausible(name, safeProps ? { props: safeProps } : undefined)
  return true
}
