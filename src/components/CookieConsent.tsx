import { setAnalyticsConsent } from '@/lib/ga4Runtime';
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { COOKIE_CONSENT_KEY, createConsentState, parseCookieConsent, serializeCookieConsent, type CookieConsentState } from '@/lib/cookieConsent'
import { readBrowserStorage, writeBrowserStorage, removeBrowserStorage } from '@/lib/browserStorage'

// Ads-kontot kan bytas via VITE_GOOGLE_ADS_ID utan kodändring (fallback = nuvarande konto)
const ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim() || 'AW-10941540384'
type Gtag = (...args: unknown[]) => void

declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag } }
let gtagScriptInjected = false

const ensureDataLayer = (): Gtag | null => {
  if (typeof window === 'undefined') return null
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args) }
  return window.gtag
}

const injectGtagScript = () => {
  if (gtagScriptInjected || typeof document === 'undefined') return
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) { gtagScriptInjected = true; return }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`
  document.head.appendChild(script)
  gtagScriptInjected = true
}

const applyConsent = (state: Pick<CookieConsentState, 'analytics' | 'marketing'>) => {
  const gtag = ensureDataLayer()
  if (!gtag) return
  gtag('consent', 'update', {
    analytics_storage: state.analytics ? 'granted' : 'denied',
    ad_storage: state.marketing ? 'granted' : 'denied',
    ad_user_data: state.marketing ? 'granted' : 'denied',
    ad_personalization: state.marketing ? 'granted' : 'denied',
  })
  setAnalyticsConsent(state.analytics)
  if (!state.marketing) return
  injectGtagScript()
  gtag('js', new Date())
  if (state.marketing) gtag('config', ADS_ID)
}

const CookieConsent = () => {
  const { pathname } = useLocation()
  const hasBottomNavigation = pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/dashboard/') || pathname === '/'
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = parseCookieConsent(readBrowserStorage('localStorage', COOKIE_CONSENT_KEY))
    if (!stored) { removeBrowserStorage('localStorage', COOKIE_CONSENT_KEY); setVisible(true); return }
    setAnalytics(stored.analytics)
    setMarketing(stored.marketing)
    writeBrowserStorage('localStorage', COOKIE_CONSENT_KEY, serializeCookieConsent(stored))
    applyConsent(stored)
  }, [])

  useEffect(() => {
    const openSettings = () => {
      const stored = parseCookieConsent(readBrowserStorage('localStorage', COOKIE_CONSENT_KEY))
      setAnalytics(stored?.analytics ?? false)
      setMarketing(stored?.marketing ?? false)
      setShowDetails(true)
      setVisible(true)
    }
    window.addEventListener('updro:open-cookie-settings', openSettings)
    return () => window.removeEventListener('updro:open-cookie-settings', openSettings)
  }, [])

  const persist = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const state = createConsentState(nextAnalytics, nextMarketing)
    writeBrowserStorage('localStorage', COOKIE_CONSENT_KEY, serializeCookieConsent(state))
    setAnalytics(nextAnalytics); setMarketing(nextMarketing); applyConsent(state); setVisible(false); setShowDetails(false)
  }

  if (!visible) return <button type="button" onClick={() => { setShowDetails(true); setVisible(true) }} className={`fixed ${hasBottomNavigation ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-3' : 'bottom-3'} left-3 z-40 rounded-full border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur hover:text-foreground`} aria-label="Ändra cookieinställningar">Cookieinställningar</button>

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-2 sm:p-3" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
      <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur border rounded-2xl shadow-lg p-3 sm:px-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs sm:text-sm text-foreground/80 flex-1">
            <span id="cookie-consent-title" className="font-semibold text-foreground">Cookies: </span>
            nödvändiga för inloggning och säkerhet. Statistik och marknadsföring är frivilliga.{' '}
            <Link to="/cookies" className="text-primary hover:underline">Läs mer</Link>
          </p>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails}>Anpassa</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => persist(false, false)}>Neka alla</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => persist(true, true)}>Acceptera alla</Button>
          </div>
        </div>
        {showDetails && (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-stretch">
            <div className="rounded-xl border p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Nödvändiga</span><span className="text-xs text-muted-foreground">Alltid aktiva</span></div><p className="mt-1 text-xs text-muted-foreground">Grundläggande funktioner och säkerhet.</p></div>
            <label className="rounded-xl border p-3 cursor-pointer flex flex-col gap-1"><span className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Statistik</span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="h-4 w-4 accent-primary" /></span><span className="text-xs text-muted-foreground">Google Analytics för att förstå användningen.</span></label>
            <label className="rounded-xl border p-3 cursor-pointer flex flex-col gap-1"><span className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Marknadsföring</span><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="h-4 w-4 accent-primary" /></span><span className="text-xs text-muted-foreground">Google Ads för konverteringsmätning.</span></label>
            <Button size="sm" className="rounded-xl sm:h-auto" onClick={() => persist(analytics, marketing)}>Spara val</Button>
          </div>
        )}
        {showDetails && <p className="text-xs text-muted-foreground">Läs vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link> och <Link to="/cookies" className="text-primary hover:underline">cookiepolicy</Link>.</p>}
      </div>
    </div>
  )
}


export default CookieConsent
