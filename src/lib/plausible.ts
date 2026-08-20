/**
 * Typed Plausible Analytics helper.
 *
 * The Plausible script itself is loaded once from index.html. This module only
 * pushes events into the global `plausible()` queue. It is safe to call before
 * the script has finished loading — Plausible's own snippet defines a queue
 * (`plausible.q`) that flushes on load.
 *
 * The snippet disables auto pageviews and auto form submissions. Pageviews are
 * sent from the SPA hook so `/admin` and `/dashboard` are skipped on both hard
 * load and client navigation. Real conversions use the named events below.
 *
 * Strict privacy rules enforced here:
 *   - Only low-cardinality, non-identifying property values are accepted.
 *   - Event names are a fixed union — no free-form names from call sites.
 *   - Pageviews never include briefs, tokens or other non-attribution query data.
 */

export type PlausibleEventName =
  | 'Uppdrag Started'
  | 'Uppdrag Submitted'
  | 'Agency Signup Completed'
  | 'Buyer Signup Completed'
  | 'Campaign Code Applied'
  | 'Referral Link Copied'
  | 'Offer Submitted'
  | 'Lead Unlocked'
  | 'Subscription Checkout Started'
  | 'Subscription Purchased'
  | 'Category Selected'
  | 'Uppdrag Details Completed'
  | 'Uppdrag Qualified'
  | 'First Offer Received'
  | 'Agency Selected'
  | 'Agency Signup Started'
  | 'Lead Viewed'
  | 'Lead Unlock Started'
  | 'Lead Purchase Completed'

export const PLAUSIBLE_EVENT_NAMES: readonly PlausibleEventName[] = [
  'Uppdrag Started',
  'Uppdrag Submitted',
  'Agency Signup Completed',
  'Buyer Signup Completed',
  'Campaign Code Applied',
  'Referral Link Copied',
  'Offer Submitted',
  'Lead Unlocked',
  'Subscription Checkout Started',
  'Subscription Purchased',
  'Category Selected',
  'Uppdrag Details Completed',
  'Uppdrag Qualified',
  'First Offer Received',
  'Agency Selected',
  'Agency Signup Started',
  'Lead Viewed',
  'Lead Unlock Started',
  'Lead Purchase Completed',
]

export type PlausibleUserType = 'guest' | 'buyer' | 'supplier'
export type PlausibleBillingInterval = 'one_time' | 'monthly' | 'yearly'
export type PlausiblePlan = 'lead' | 'monthly' | 'yearly' | 'trial' | 'standard' | 'premium'
export type PlausiblePricingModel = 'lead' | 'monthly' | 'yearly'
export type PlausibleValueSegment = 'under_10k' | '10k_50k' | '50k_150k' | 'over_150k' | 'unknown'

/**
 * Low-cardinality property allowlist. Anything not on this list is dropped so
 * that call sites cannot accidentally send PII (email, company name, brief
 * title, internal ids, etc.).
 */
export interface PlausibleProps {
  category?: string
  city?: string
  landing_page?: string
  acquisition_channel?: string
  campaign?: string
  plan?: PlausiblePlan | string
  billing_interval?: PlausibleBillingInterval
  pricing_model?: PlausiblePricingModel
  project_value_segment?: PlausibleValueSegment
  source?: string
  user_type?: PlausibleUserType
}

const ALLOWED_KEYS: readonly (keyof PlausibleProps)[] = [
  'category',
  'city',
  'landing_page',
  'acquisition_channel',
  'campaign',
  'plan',
  'billing_interval',
  'pricing_model',
  'project_value_segment',
  'source',
  'user_type',
]

const VALUE_SEGMENTS = new Set<PlausibleValueSegment>([
  'under_10k',
  '10k_50k',
  '50k_150k',
  'over_150k',
  'unknown',
])

export const projectValueSegment = (budget?: string | null): PlausibleValueSegment => {
  if (budget && VALUE_SEGMENTS.has(budget as PlausibleValueSegment)) {
    return budget as PlausibleValueSegment
  }
  return 'unknown'
}

// Reject anything that looks like an email, url, uuid, long token or free text.
const MAX_VALUE_LEN = 40
const EMAIL_RE = /@/
const URL_RE = /^https?:\/\//i
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

const isSafeLandingPage = (value: string): boolean => {
  if (!value.startsWith('/')) return false
  if (value.includes('?') || value.includes('#') || value.includes('://')) return false
  return isTrackablePath(value)
}

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
    if (key === 'landing_page' && !isSafeLandingPage(value)) continue
    out[key] = value
  }
  return Object.keys(out).length > 0 ? out : undefined
}

// Paths on which we never send pageviews — admin surfaces and other
// authenticated dashboards can contain buyer names, project titles etc. in the
// document.title. Custom events from those surfaces are still allowed.
const SENSITIVE_PATH_PREFIXES = ['/admin', '/dashboard']

export const isTrackablePath = (path: string): boolean => {
  const pathname = path.split('?')[0].split('#')[0] || '/'
  return !SENSITIVE_PATH_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/** Attribution query keys Plausible already treats as traffic-source data. */
export const PLAUSIBLE_ATTRIBUTION_QUERY_KEYS = [
  'ref',
  'source',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export const buildPlausiblePageviewUrl = (origin: string, path: string, search = ''): string => {
  const pathname = path.split('?')[0].split('#')[0] || '/'
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const kept = new URLSearchParams()
  for (const key of PLAUSIBLE_ATTRIBUTION_QUERY_KEYS) {
    const value = params.get(key)?.trim()
    if (value) kept.set(key, value)
  }
  const qs = kept.toString()
  return `${origin}${pathname}${qs ? `?${qs}` : ''}`
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

/** Test-only reset. Kept so older tests can call it after state was removed. */
export const __resetPlausibleStateForTests = () => {
  /* no module state to reset */
}

export const trackPlausiblePageview = (path: string): boolean => {
  if (typeof window === 'undefined') return false
  if (!isTrackablePath(path)) return false
  const plausible = getPlausible()
  if (!plausible) return false
  const url = buildPlausiblePageviewUrl(window.location.origin, path, window.location.search)
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
