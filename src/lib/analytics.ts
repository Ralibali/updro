import {
  trackPlausibleEvent,
  trackPlausiblePageview,
  type PlausibleBillingInterval,
  type PlausiblePlan,
} from '@/lib/plausible'

type AnalyticsValue = string | number | boolean | null | undefined

type AnalyticsParams = Record<string, AnalyticsValue | AnalyticsValue[] | Record<string, AnalyticsValue>[]>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const adsLeadDestination = (import.meta.env.VITE_GOOGLE_ADS_LEAD_SEND_TO as string | undefined)?.trim()

const getGtag = () => {
  if (typeof window === 'undefined') return null
  return window.gtag ?? null
}

/**
 * Events are queued in dataLayer before consent and are only transmitted when
 * Google scripts are loaded after the visitor has accepted analytics cookies.
 */
export const trackAnalyticsEvent = (eventName: string, params: AnalyticsParams = {}) => {
  getGtag()?.('event', eventName, params)
}

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined') return

  // Do not send query parameters. The project wizard may contain a user's brief
  // in the URL, which must never be forwarded to analytics providers.
  trackAnalyticsEvent('page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  })

  // Plausible SPA pageview (dedupes the initial load itself).
  trackPlausiblePageview(path)
}

export const trackLeadStarted = (source: string) => {
  trackAnalyticsEvent('begin_lead', {
    lead_source: source,
  })
  trackPlausibleEvent('Brief Started', { source })
}

/** Dedupes the given event once per browser session using sessionStorage. */
export const trackOnceInSession = (key: string, fn: () => void): boolean => {
  if (typeof sessionStorage === 'undefined') { fn(); return true }
  const stamp = `updro:evt:${key}`
  if (sessionStorage.getItem(stamp)) return false
  sessionStorage.setItem(stamp, '1')
  fn()
  return true
}

export const trackLeadSubmitted = ({
  source,
  category,
  userType,
}: {
  source: string
  category: string
  userType: 'guest' | 'buyer'
}) => {
  const params = {
    lead_source: source,
    lead_category: category,
    user_type: userType,
  }

  // GA4 event: mark "generate_lead" as a key event in GA4 or import it into Ads.
  trackAnalyticsEvent('generate_lead', params)

  // Optional direct Google Ads conversion. Configure the complete value,
  // for example AW-123456789/AbCdEfGhIjk, as VITE_GOOGLE_ADS_LEAD_SEND_TO.
  if (adsLeadDestination) {
    getGtag()?.('event', 'conversion', {
      send_to: adsLeadDestination,
    })
  }

  trackPlausibleEvent('Brief Submitted', { source, category, user_type: userType })
}

export const trackSignUp = (role: 'buyer' | 'supplier') => {
  trackAnalyticsEvent('sign_up', {
    method: 'email',
    user_role: role,
  })
  if (role === 'supplier') {
    trackPlausibleEvent('Agency Signup Completed', { user_type: 'supplier' })
  }
}

const PLAN_TO_INTERVAL: Record<string, PlausibleBillingInterval> = {
  lead: 'one_time',
  monthly: 'monthly',
  yearly: 'yearly',
}

export const trackBeginCheckout = (planId: string, value: number) => {
  trackAnalyticsEvent('begin_checkout', {
    currency: 'SEK',
    value,
    plan_id: planId,
  })
  trackPlausibleEvent('Subscription Checkout Started', {
    plan: planId as PlausiblePlan,
    billing_interval: PLAN_TO_INTERVAL[planId],
  })
}

export const trackOfferSubmitted = (category?: string) => {
  trackPlausibleEvent('Offer Submitted', category ? { category } : undefined)
}

export const trackLeadUnlocked = (category?: string) => {
  trackPlausibleEvent('Lead Unlocked', category ? { category } : undefined)
}

export const trackSubscriptionPurchased = (planId: string) => {
  trackPlausibleEvent('Subscription Purchased', {
    plan: planId as PlausiblePlan,
    billing_interval: PLAN_TO_INTERVAL[planId],
  })
}
