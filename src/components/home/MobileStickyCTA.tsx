import { ArrowRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBottomInset } from '@/hooks/useBottomInset'
import { useAuth } from '@/hooks/useAuth'
import { trackClick } from '@/hooks/usePageTracking'

const MobileStickyCTA = () => {
  const { isAuthenticated, isSupplier, isAdmin } = useAuth()
  const [pastHero, setPastHero] = useState(false)
  const [available, setAvailable] = useState(false)
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem('updro-promo-dismissed') === '1' } catch { return false } })
  const show = pastHero && available && !dismissed && !(isAuthenticated && (isSupplier || isAdmin))
  const bannerRef = useBottomInset(show, 'promo')

  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer')
      setAvailable(window.innerWidth < 768 && !document.querySelector('[data-cookie-consent-banner]') && (!footer || footer.getBoundingClientRect().top >= innerHeight))
    }
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    const form = document.getElementById('homepage-project-form')
    if (!form || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
    })
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  if (!show) return null

  return (
    <div ref={bannerRef} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="pt-1 font-display text-xs font-bold text-foreground">Gratis · max tre offerter</p>
        </div>
        <button
          type="submit"
          form="homepage-project-form"
          onClick={() => trackClick('mobile_sticky_cta', 'Starta gratis', { placement: 'homepage_sticky' })}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-accent px-5 font-display text-sm font-bold text-accent-foreground shadow-sm motion-safe:active:scale-[0.98]"
        >
          Starta gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Stäng erbjudandet" className="grid min-h-11 min-w-11 place-items-center rounded-full border" onClick={() => { setDismissed(true); try { localStorage.setItem('updro-promo-dismissed', '1') } catch { /* Current visit only */ } }}><X className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

export default MobileStickyCTA
