import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { COOKIE_CONSENT_KEY, createConsentState, parseCookieConsent, serializeCookieConsent, type CookieConsentState } from '@/lib/cookieConsent'

const GA_ID = 'G-C0XMZG0KDQ'
const ADS_ID = 'AW-10941540384'
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
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) { gtagScriptInjected = true; return }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
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
  if (!state.analytics && !state.marketing) return
  injectGtagScript()
  gtag('js', new Date())
  if (state.analytics) gtag('config', GA_ID, { anonymize_ip: true })
  if (state.marketing) gtag('config', ADS_ID)
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const gtag = ensureDataLayer()
    gtag?.('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 })
    const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
    if (!stored) { localStorage.removeItem(COOKIE_CONSENT_KEY); setVisible(true); return }
    setAnalytics(stored.analytics)
    setMarketing(stored.marketing)
    localStorage.setItem(COOKIE_CONSENT_KEY, serializeCookieConsent(stored))
    applyConsent(stored)
  }, [])

  useEffect(() => {
    const openSettings = () => {
      const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
      setAnalytics(stored?.analytics ?? false)
      setMarketing(stored?.marketing ?? false)
      setVisible(true)
    }
    window.addEventListener('updro:open-cookie-settings', openSettings)
    return () => window.removeEventListener('updro:open-cookie-settings', openSettings)
  }, [])

  const persist = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const state = createConsentState(nextAnalytics, nextMarketing)
    localStorage.setItem(COOKIE_CONSENT_KEY, serializeCookieConsent(state))
    setAnalytics(nextAnalytics); setMarketing(nextMarketing); applyConsent(state); setVisible(false)
  }

  if (!visible) return <button type="button" onClick={() => setVisible(true)} className="fixed bottom-3 left-3 z-40 rounded-full border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur hover:text-foreground" aria-label="Ändra cookieinställningar">Cookieinställningar</button>

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
      <div className="max-w-3xl mx-auto bg-card border rounded-2xl shadow-lg p-5 flex flex-col gap-4">
        <div className="text-sm text-foreground/80"><p id="cookie-consent-title" className="font-semibold text-foreground mb-1">Dina cookieval</p><p>Nödvändig lagring används för inloggning, säkerhet och ditt val. Statistik och marknadsföring är frivilliga och aktiveras endast för vald kategori. Läs vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link> och <Link to="/cookies" className="text-primary hover:underline">cookiepolicy</Link>.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Nödvändiga</span><span className="text-xs text-muted-foreground">Alltid aktiva</span></div><p className="mt-1 text-xs text-muted-foreground">Grundläggande funktioner och säkerhet.</p></div>
          <label className="rounded-xl border p-3 cursor-pointer flex flex-col gap-2"><span className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Statistik</span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="h-4 w-4 accent-primary" /></span><span className="text-xs text-muted-foreground">Google Analytics för att förstå användningen.</span></label>
          <label className="rounded-xl border p-3 cursor-pointer flex flex-col gap-2"><span className="flex items-center justify-between gap-3"><span className="font-medium text-sm">Marknadsföring</span><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="h-4 w-4 accent-primary" /></span><span className="text-xs text-muted-foreground">Google Ads för konverteringsmätning.</span></label>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => persist(false, false)}>Neka alla</Button>
          <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => persist(analytics, marketing)}>Spara val</Button>
          <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={() => persist(true, true)}>Acceptera alla</Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
