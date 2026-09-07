import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { trackClick } from '@/hooks/usePageTracking'

const MobileStickyCTA = () => {
  const { isAuthenticated, isSupplier, isAdmin } = useAuth()
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const form = document.getElementById('homepage-project-form')
    if (!form || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
    })
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  if (!pastHero || (isAuthenticated && (isSupplier || isAdmin))) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="pt-1 font-display text-xs font-bold text-foreground">Gratis · max tre offerter</p>
        </div>
        <Link
          to="/publicera"
          onClick={() => trackClick('mobile_sticky_cta', 'Starta gratis', { placement: 'homepage_sticky' })}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-accent px-5 font-display text-sm font-bold text-accent-foreground shadow-sm motion-safe:active:scale-[0.98]"
        >
          Starta gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default MobileStickyCTA
