import { getStoredAttribution } from '@/lib/attribution'
import {
  isTrackablePath,
  projectValueSegment,
  trackPlausibleEvent,
  trackPlausiblePageview,
  type PlausibleBillingInterval,
  type PlausiblePlan,
  type PlausiblePricingModel,
  type PlausibleProps,
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

  // Plausible SPA + hard-load pageview. Sensitive paths are dropped inside.
  trackPlausiblePageview(path)
}

const asSafeCity = (city?: string): string | undefined => {
  const value = city?.trim()
  if (!value) return undefined
  return value
}

/** Attach first-touch attribution when present. Never includes raw URLs or PII. */
export const withPlausibleContext = (extra?: PlausibleProps): PlausibleProps => {
  const touch = getStoredAttribution().first ?? getStoredAttribution().latest
  const landing = touch?.landing_path?.trim()
  return {
    landing_page: landing && isTrackablePath(landing) ? landing : undefined,
    acquisition_channel: touch?.source ?? undefined,
    campaign: touch?.campaign ?? undefined,
    ...extra,
  }
}

export const trackLeadStarted = (source: string) => {
  trackAnalyticsEvent('begin_lead', {
    lead_source: source,
  })
  trackPlausibleEvent('Uppdrag Started', withPlausibleContext({ source }))
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
  budgetRange,
}: {
  source: string
  category: string
  userType: 'guest' | 'buyer'
  budgetRange?: string
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

  trackPlausibleEvent('Uppdrag Submitted', withPlausibleContext({
    source,
    category,
    user_type: userType,
    project_value_segment: projectValueSegment(budgetRange),
  }))
}

export const trackSignUp = (role: 'buyer' | 'supplier') => {
  trackAnalyticsEvent('sign_up', {
    method: 'email',
    user_role: role,
  })
  if (role === 'supplier') {
    trackPlausibleEvent('Agency Signup Completed', withPlausibleContext({ user_type: 'supplier' }))
  } else {
    trackPlausibleEvent('Buyer Signup Completed', withPlausibleContext({ user_type: 'buyer' }))
  }
}

/** Kampanjkod aktiverades vid byråregistrering (t.ex. grundarmedlemskap). */
export const trackCampaignCodeApplied = () => {
  trackPlausibleEvent('Campaign Code Applied', withPlausibleContext({ user_type: 'supplier' }))
}

/** Byrå kopierade sin värvningslänk i dashboarden. */
export const trackReferralLinkCopied = () => {
  trackPlausibleEvent('Referral Link Copied', withPlausibleContext({ user_type: 'supplier' }))
}

const PLAN_TO_INTERVAL: Record<string, PlausibleBillingInterval> = {
  lead: 'one_time',
  monthly: 'monthly',
  yearly: 'yearly',
}

const planPricingModel = (planId: string): PlausiblePricingModel | undefined => {
  if (planId === 'lead' || planId === 'monthly' || planId === 'yearly') return planId
  return undefined
}

export const trackBeginCheckout = (planId: string, value: number) => {
  trackAnalyticsEvent('begin_checkout', {
    currency: 'SEK',
    value,
    plan_id: planId,
  })
  trackPlausibleEvent('Subscription Checkout Started', withPlausibleContext({
    plan: planId as PlausiblePlan,
    billing_interval: PLAN_TO_INTERVAL[planId],
    pricing_model: planPricingModel(planId),
  }))
}

export const trackOfferSubmitted = (category?: string, city?: string) => {
  trackPlausibleEvent('Offer Submitted', withPlausibleContext({
    category,
    city: asSafeCity(city),
  }))
}

export const trackLeadUnlocked = (category?: string, city?: string) => {
  trackPlausibleEvent('Lead Unlocked', withPlausibleContext({
    category,
    city: asSafeCity(city),
    user_type: 'supplier',
  }))
}

export const trackSubscriptionPurchased = (planId: string) => {
  trackPlausibleEvent('Subscription Purchased', withPlausibleContext({
    plan: planId as PlausiblePlan,
    billing_interval: PLAN_TO_INTERVAL[planId],
    pricing_model: planPricingModel(planId),
  }))
}

export const trackLeadPurchaseCompleted = () => {
  trackPlausibleEvent('Lead Purchase Completed', withPlausibleContext({
    plan: 'lead',
    billing_interval: 'one_time',
    pricing_model: 'lead',
    user_type: 'supplier',
  }))
}

/** Split 119 kr lead purchases from monthly/yearly subscriptions. */
export const trackPurchaseCompleted = (planId: string) => {
  if (planId === 'lead') {
    trackLeadPurchaseCompleted()
    return
  }
  trackSubscriptionPurchased(planId)
}

export const trackCategorySelected = (category: string) => {
  trackOnceInSession('category_selected', () => {
    trackPlausibleEvent('Category Selected', withPlausibleContext({ category }))
  })
}

export const trackUppdragDetailsCompleted = (input: { category: string; budgetRange?: string }) => {
  trackOnceInSession('uppdrag_details_completed', () => {
    trackPlausibleEvent('Uppdrag Details Completed', withPlausibleContext({
      category: input.category,
      project_value_segment: projectValueSegment(input.budgetRange),
    }))
  })
}

export const trackUppdragQualified = (input?: { category?: string; city?: string; budgetRange?: string }) => {
  trackPlausibleEvent('Uppdrag Qualified', withPlausibleContext({
    category: input?.category,
    city: asSafeCity(input?.city),
    project_value_segment: projectValueSegment(input?.budgetRange),
  }))
}

export const trackFirstOfferReceived = (category?: string, city?: string) => {
  trackPlausibleEvent('First Offer Received', withPlausibleContext({
    category,
    city: asSafeCity(city),
  }))
}

export const trackAgencySelected = (category?: string, city?: string) => {
  trackPlausibleEvent('Agency Selected', withPlausibleContext({
    category,
    city: asSafeCity(city),
    user_type: 'buyer',
  }))
}

export const trackAgencySignupStarted = () => {
  trackOnceInSession('agency_signup_started', () => {
    trackPlausibleEvent('Agency Signup Started', withPlausibleContext({ user_type: 'supplier' }))
  })
}

export const trackLeadViewed = (projectKey: string, props?: { category?: string; city?: string }) => {
  trackOnceInSession(`lead_viewed:${projectKey}`, () => {
    trackPlausibleEvent('Lead Viewed', withPlausibleContext({
      category: props?.category,
      city: asSafeCity(props?.city),
      user_type: 'supplier',
    }))
  })
}

export const trackLeadUnlockStarted = (props?: { category?: string; city?: string }) => {
  trackPlausibleEvent('Lead Unlock Started', withPlausibleContext({
    category: props?.category,
    city: asSafeCity(props?.city),
    user_type: 'supplier',
  }))
}
