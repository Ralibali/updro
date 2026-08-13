import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { trackClick } from '@/hooks/usePageTracking'

const MobileStickyCTA = () => {
  const { isAuthenticated, isSupplier, isAdmin } = useAuth()

  if (isAuthenticated && (isSupplier || isAdmin)) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-foreground">Jämför upp till tre offerter</p>
          <p className="truncate text-[11px] text-muted-foreground">Gratis · ingen registrering för att börja</p>
        </div>
        <Link
          to="/publicera"
          onClick={() => trackClick('mobile_sticky_cta', 'Starta gratis', { placement: 'homepage_sticky' })}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border-2 border-foreground bg-accent px-5 font-display text-sm font-bold text-accent-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Starta gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default MobileStickyCTA
