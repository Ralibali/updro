import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'updro_cookie_consent'
const GA_ID = 'G-C0XMZG0KDQ'
const ADS_ID = 'AW-10941540384'

let gtagScriptInjected = false

/** Load gtag.js exactly once – only after the user has granted consent */
const injectGtagScript = () => {
  if (gtagScriptInjected) return
  if (typeof document === 'undefined') return
  gtagScriptInjected = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  const gtag = (window as any).gtag
  if (typeof gtag === 'function') {
    gtag('js', new Date())
    gtag('config', GA_ID, { anonymize_ip: true })
    gtag('config', ADS_ID)
  }
}

/** Apply consent to gtag – block analytics until user accepts */
const applyConsent = (level: 'all' | 'necessary') => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  const gtag = (window as any).gtag

  if (level === 'all') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
    injectGtagScript()
  } else {
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(COOKIE_KEY)
    if (raw) {
      try {
        const { level } = JSON.parse(raw)
        applyConsent(level)
      } catch {
        // Invalid stored value – ask again
        setVisible(true)
      }
    } else {
      setVisible(true)
    }
  }, [])

  const accept = (level: 'all' | 'necessary') => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ level, date: new Date().toISOString() }))
    applyConsent(level)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-card border rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-foreground/80">
          <p className="font-semibold text-foreground mb-1">🍪 Vi använder cookies</p>
          <p>Vi använder nödvändiga cookies för att tjänsten ska fungera. Med ditt samtycke använder vi även analyscookies för att förbättra upplevelsen. Läs mer i vår{' '}
            <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link> och{' '}
            <Link to="/cookies" className="text-primary hover:underline">cookiepolicy</Link>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => accept('necessary')}>
            Bara nödvändiga
          </Button>
          <Button size="sm" className="rounded-xl bg-primary text-primary-foreground" onClick={() => accept('all')}>
            Acceptera alla
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
