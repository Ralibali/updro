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
}

export const trackLeadStarted = (source: string) => {
  trackAnalyticsEvent('begin_lead', {
    lead_source: source,
  })
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
}

export const trackSignUp = (role: 'buyer' | 'supplier') => {
  trackAnalyticsEvent('sign_up', {
    method: 'email',
    user_role: role,
  })
}

export const trackBeginCheckout = (planId: string, value: number) => {
  trackAnalyticsEvent('begin_checkout', {
    currency: 'SEK',
    value,
    plan_id: planId,
  })
}
