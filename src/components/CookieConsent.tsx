import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'updro_cookie_consent'

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) setVisible(true)
  }, [])

  const accept = (level: 'all' | 'necessary') => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ level, date: new Date().toISOString() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-card border rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-foreground/80">
          <p className="font-semibold text-foreground mb-1">🍪 Vi använder cookies</p>
          <p>Vi använder nödvändiga cookies för att tjänsten ska fungera. Med ditt samtycke använder vi även analyscookies för att förbättra upplevelsen. Läs mer i vår{' '}
            <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link>.
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
