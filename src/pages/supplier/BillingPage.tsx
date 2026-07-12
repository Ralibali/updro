import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, CreditCard, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import TrialBanner from '@/components/TrialBanner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { trackBeginCheckout } from '@/lib/analytics'
import { PLANS, STRIPE_PRODUCTS, TRIAL_LEADS } from '@/lib/constants'
import { numWord } from '@/lib/numberWords'

const BillingPage = () => {
  const { isOnTrial, trialLeadsLeft, trialDaysLeft, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<{ subscribed: boolean; plan: string | null; subscription_end: string | null; interval?: 'month' | 'year'; cancel_at_period_end?: boolean }>({
    subscribed: false,
    plan: null,
    subscription_end: null,
  })

  const [checkingSubscription, setCheckingSubscription] = useState(false)

  const checkSubscription = async () => {
    setCheckingSubscription(true)
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription')
      if (error) throw error
      if (data) {
        setSubscription(data)
        await refreshProfile()
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Subscription check failed', error)
    } finally {
      setCheckingSubscription(false)
    }
  }

  useEffect(() => {
    const success = searchParams.get('success') === 'true'
    const canceled = searchParams.get('canceled') === 'true'
    const sessionId = searchParams.get('session_id')

    const finalizeCheckout = async () => {
      try {
        if (sessionId) {
          const { error } = await supabase.functions.invoke('confirm-checkout', {
            body: { sessionId },
          })
          if (error) throw error
        }
        await checkSubscription()
        await refreshProfile()
        toast.success('Betalningen är bekräftad och ditt konto har uppdaterats.')
      } catch (error) {
        console.error('Checkout confirmation failed', error)
        toast.error('Betalningen lyckades, men kontot kunde inte uppdateras direkt. Ladda om sidan om en stund.')
      }
    }

    if (success) {
      finalizeCheckout()
    } else if (canceled) {
      toast.info('Betalningen avbröts.')
    }

    if (success || canceled) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  useEffect(() => {
    checkSubscription()
  }, [])

  const handleCheckout = async (planId: string) => {
    if (loading) return
    const product = STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS] ?? STRIPE_PRODUCTS.lead
    setLoading(planId)
    trackBeginCheckout(planId, product.price)


    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
      })
      if (error) throw error
      if (!data?.url) throw new Error('Betallänken kunde inte skapas.')

      window.location.assign(data.url)
    } catch (error: any) {
      toast.error(error?.message || 'Något gick fel vid checkout')
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (loading) return
    setLoading('portal')
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal')
      if (error) throw error
      if (!data?.url) throw new Error('Kundportalen kunde inte öppnas.')
      window.location.assign(data.url)
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte öppna kundportalen')
      setLoading(null)
    }
  }

  const handleManageAction = async (action: 'switch' | 'cancel' | 'resume', target?: 'monthly' | 'yearly') => {
    if (loading) return
    if (action === 'cancel' && !window.confirm('Vill du säga upp abonnemanget? Du behåller tillgången till periodens slut.')) return
    if (action === 'switch' && target && !window.confirm(target === 'yearly' ? 'Byt till årskort? Mellanskillnaden proportioneras på nästa faktura.' : 'Byt till månadskort? Ändringen träder i kraft direkt.')) return
    const key = action === 'switch' ? `switch-${target}` : action
    setLoading(key)
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', { body: { action, target } })
      if (error) throw error
      toast.success(data?.message || 'Abonnemanget är uppdaterat.')
      await checkSubscription()
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte uppdatera abonnemanget')
    } finally {
      setLoading(null)
    }
  }


  return (
    <div className="max-w-4xl">
      <TrialBanner />
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Abonnemang och betalning</h1>
        {checkingSubscription && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Kontrollerar abonnemang" />}
      </div>

      {subscription.subscribed && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">
              {subscription.interval === 'year' ? 'Årskort aktivt' : 'Månadskort aktivt'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Du har obegränsade leads. {subscription.cancel_at_period_end ? 'Abonnemanget avslutas' : 'Nästa fakturadatum:'} {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString('sv-SE') : '–'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {subscription.interval === 'month' && !subscription.cancel_at_period_end && (
              <Button variant="default" size="sm" onClick={() => handleManageAction('switch', 'yearly')} disabled={loading !== null}>
                {loading === 'switch-yearly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Uppgradera till årskort
              </Button>
            )}
            {subscription.interval === 'year' && !subscription.cancel_at_period_end && (
              <Button variant="outline" size="sm" onClick={() => handleManageAction('switch', 'monthly')} disabled={loading !== null}>
                {loading === 'switch-monthly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Byt till månadskort
              </Button>
            )}
            {subscription.cancel_at_period_end ? (
              <Button variant="outline" size="sm" onClick={() => handleManageAction('resume')} disabled={loading !== null}>
                {loading === 'resume' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Återaktivera abonnemang
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleManageAction('cancel')} disabled={loading !== null}>
                {loading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Avbryt abonnemang
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleManageSubscription} disabled={loading !== null}>
              {loading === 'portal' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              Kundportal
            </Button>
          </div>
        </div>
      )}


      {isOnTrial && !subscription.subscribed && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display font-semibold">Provperiod aktiv</h2>
          </div>
          <p className="text-sm text-muted-foreground">{numWord(trialLeadsLeft)} av {numWord(TRIAL_LEADS)} gratis leads kvar · {numWord(trialDaysLeft)} dagar kvar</p>
          <div className="flex gap-1 mt-3" aria-label={`${trialLeadsLeft} lead-krediter kvar`}>
            {Array.from({ length: TRIAL_LEADS }).map((_, index) => (
              <div key={index} className={`h-2 flex-1 rounded-full ${index < (TRIAL_LEADS - trialLeadsLeft) ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isActive = subscription.subscribed && (plan.id === 'monthly' || plan.id === 'yearly')
          return (
            <div key={plan.id} className={`bg-card rounded-2xl border p-6 relative ${plan.highlighted ? 'border-primary shadow-md ring-2 ring-primary/20' : ''} ${isActive ? 'ring-2 ring-accent' : ''}`}>
              {plan.highlighted && !isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-3 py-1">{plan.badge}</span>}
              {isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold rounded-full px-3 py-1">Din plan</span>}
              <h2 className="font-display font-bold text-lg">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price.toLocaleString('sv-SE')}</span>
                <span className="text-sm text-muted-foreground ml-1">kr {plan.per}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map(feature => <li key={feature} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" /><span>{feature}</span></li>)}
              </ul>
              <Button onClick={() => isActive ? handleManageSubscription() : handleCheckout(plan.id)} className={`w-full mt-6 rounded-xl ${plan.highlighted && !isActive ? 'bg-primary hover:bg-primary/90' : ''}`} variant={plan.highlighted && !isActive ? 'default' : 'outline'} disabled={loading !== null}>
                {loading === plan.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isActive ? 'Hantera abonnemang' : plan.cta}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BillingPage
