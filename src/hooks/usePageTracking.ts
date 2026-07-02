import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { trackPageView } from '@/lib/analytics'

function getSessionId() {
  let id = sessionStorage.getItem('_sid')
  if (!id) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('_sid', id)
  }
  return id
}

function getDeviceType(): string {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

// Filter obvious bots/crawlers/preview tools from internal analytics so the
// admin dashboard reflects real human traffic. This does NOT affect Lovable's
// external analytics (hosting-side), only the page_views table.
const BOT_UA_PATTERN = /bot|crawler|spider|crawling|headless|lighthouse|slurp|bingpreview|facebookexternalhit|embedly|whatsapp|slackbot|telegrambot|discordbot|preview|pingdom|monitor|axios|python-requests|curl\//i

function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true
  const ua = navigator.userAgent || ''
  if (!ua) return true
  if (BOT_UA_PATTERN.test(ua)) return true
  // navigator.webdriver is true for automated browsers (Playwright, Selenium).
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true
  return false
}

export function usePageTracking() {
  const location = useLocation()
  const lastPath = useRef('')

  useEffect(() => {
    const path = location.pathname
    // Skip admin and dashboard routes from tracking
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) return
    // Don't double-track same path
    if (path === lastPath.current) return
    lastPath.current = path

    const sessionId = getSessionId()
    const bot = isLikelyBot()

    // Internal, cookie-independent page view used by the admin analytics.
    // Bot/preview traffic is skipped so admin numbers reflect real humans.
    if (!bot) {
      supabase.from('page_views').insert({
        session_id: sessionId,
        path,
        referrer: document.referrer || null,
        device_type: getDeviceType(),
      }).then(({ error }) => {
        if (error && import.meta.env.DEV) console.warn('Page view tracking failed', error)
      })
    }

    // React Router does not trigger automatic GA4 page views after navigation.
    // Query parameters are deliberately excluded to avoid leaking project briefs.
    trackPageView(path)
  }, [location.pathname])
}

/** Track a click event. Call from onClick handlers on important CTAs. */
export function trackClick(eventName: string, elementText?: string, metadata?: Record<string, any>) {
  const sessionId = sessionStorage.getItem('_sid') || getSessionId()
  supabase.from('click_events').insert({
    session_id: sessionId,
    event_name: eventName,
    element_text: elementText || null,
    path: window.location.pathname,
    metadata: metadata || {},
  }).then(({ error }) => {
    if (error && import.meta.env.DEV) console.warn('Click tracking failed', error)
  })
}
