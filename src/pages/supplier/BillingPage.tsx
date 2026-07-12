import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, CreditCard, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import TrialBanner from '@/components/TrialBanner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { trackBeginCheckout } from '@/lib/analytics'
import { PLANS, STRIPE_PRODUCTS, TRIAL_LEADS } from '@/lib/constants'
import { numWord } from '@/lib/numberWords'

type SwitchPreview = {
  currency: string
  amount_due: number
  subtotal: number
  total: number
  proration_amount: number
  next_payment_attempt: string | null
  period_end: string | null
  current_price: { amount: number; interval: string | null }
  new_price: { amount: number; interval: string | null }
  target: 'monthly' | 'yearly'
}


const BillingPage = () => {
  const { isOnTrial, trialLeadsLeft, trialDaysLeft, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<{
    subscribed: boolean
    plan: string | null
    subscription_end: string | null
    interval?: 'month' | 'year'
    cancel_at_period_end?: boolean
    status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid'
    trial_end?: string | null
    current_period_start?: string | null
    credits?: {
      lead_credits: number
      trial_leads_used: number
      trial_ends_at: string | null
      history: { date: string; credits: number; amount_sek: number | null; plan: string | null }[]
    }
  }>({
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

  const [switchPreview, setSwitchPreview] = useState<SwitchPreview | null>(null)
  const [switchTarget, setSwitchTarget] = useState<'monthly' | 'yearly' | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'cancel' | 'switch'
    target?: 'monthly' | 'yearly'
    preview?: SwitchPreview | null
  } | null>(null)
  const [confirmingDialog, setConfirmingDialog] = useState(false)

  const openSwitchPreview = async (target: 'monthly' | 'yearly') => {
    if (loading || previewLoading) return
    setSwitchTarget(target)
    setSwitchPreview(null)
    setPreviewLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'preview', target },
      })
      if (error) throw error
      if (!data?.preview) throw new Error('Ingen prisförhandsvisning tillgänglig.')
      setSwitchPreview(data.preview as SwitchPreview)
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte hämta prisförhandsvisning')
      setSwitchTarget(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const confirmSwitch = async () => {
    if (!switchTarget || !switchPreview) return
    setConfirmDialog({ type: 'switch', target: switchTarget, preview: switchPreview })
  }

  const applySubscriptionSnapshot = (snap: any) => {
    if (!snap) return
    setSubscription(prev => ({
      ...prev,
      subscribed: snap.subscribed ?? prev.subscribed,
      status: snap.status ?? prev.status,
      interval: snap.interval ?? prev.interval,
      cancel_at_period_end: snap.cancel_at_period_end ?? prev.cancel_at_period_end,
      subscription_end: snap.subscription_end ?? prev.subscription_end,
      current_period_start: snap.current_period_start ?? prev.current_period_start,
      trial_end: snap.trial_end ?? prev.trial_end,
    }))
  }

  const executeConfirmedAction = async () => {
    if (!confirmDialog) return
    setConfirmingDialog(true)
    try {
      if (confirmDialog.type === 'switch') {
        if (!confirmDialog.target) return
        const { data, error } = await supabase.functions.invoke('manage-subscription', {
          body: { action: 'switch', target: confirmDialog.target },
        })
        if (error) throw error
        toast.success(data?.message || 'Abonnemanget är uppdaterat.')
        applySubscriptionSnapshot(data?.subscription)
        setSwitchTarget(null)
        setSwitchPreview(null)
      } else if (confirmDialog.type === 'cancel') {
        const { data, error } = await supabase.functions.invoke('manage-subscription', { body: { action: 'cancel' } })
        if (error) throw error
        toast.success(data?.message || 'Abonnemanget är uppdaterat.')
        applySubscriptionSnapshot(data?.subscription)
      }
      setConfirmDialog(null)
      checkSubscription()
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte uppdatera abonnemanget')
    } finally {
      setConfirmingDialog(false)
    }
  }

  const handleManageAction = async (action: 'cancel' | 'resume') => {
    if (loading) return
    if (action === 'cancel') {
      setConfirmDialog({ type: 'cancel' })
      return
    }
    setLoading(action)
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', { body: { action } })
      if (error) throw error
      toast.success(data?.message || 'Abonnemanget är uppdaterat.')
      applySubscriptionSnapshot(data?.subscription)
      checkSubscription()
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

      {subscription.subscribed && (() => {
        const status = subscription.status ?? 'active'
        const isTrialing = status === 'trialing'
        const isPastDue = status === 'past_due' || status === 'unpaid' || status === 'incomplete'
        const willCancel = !!subscription.cancel_at_period_end
        const endDate = subscription.subscription_end ? new Date(subscription.subscription_end) : null
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null
        const fmt = (d: Date | null) => d ? d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : '–'

        const badge = willCancel
          ? { text: 'Sägs upp vid periodens slut', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/30' }
          : isPastDue
            ? { text: 'Betalning misslyckades', cls: 'bg-destructive/15 text-destructive border-destructive/30' }
            : isTrialing
              ? { text: 'Provperiod', cls: 'bg-accent/15 text-accent-foreground border-accent/30' }
              : { text: 'Aktiv', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' }

        const nextLabel = willCancel
          ? 'Tillgången upphör'
          : isTrialing
            ? 'Provperioden slutar'
            : isPastDue
              ? 'Betalning krävs innan'
              : 'Nästa debitering'
        const nextDate = isTrialing && trialEnd ? trialEnd : endDate

        return (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold">
                {subscription.interval === 'year' ? 'Årskort' : 'Månadskort'}
              </h2>
              <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${badge.cls}`}>
                {badge.text}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">{nextLabel}</dt>
                <dd className="font-semibold mt-0.5">{fmt(nextDate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Pris</dt>
                <dd className="font-semibold mt-0.5">
                  {subscription.interval === 'year' ? '19 950 kr /år' : '1 995 kr /månad'}
                </dd>
              </div>
            </dl>

            {isPastDue && (
              <p className="text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 mb-3">
                Senaste betalningen gick inte igenom. Uppdatera ditt betalkort via Kundportal så återupptas abonnemanget automatiskt.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {subscription.interval === 'month' && !willCancel && !isPastDue && (
                <Button variant="default" size="sm" onClick={() => openSwitchPreview('yearly')} disabled={loading !== null || previewLoading}>
                  {previewLoading && switchTarget === 'yearly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Uppgradera till årskort
                </Button>
              )}
              {subscription.interval === 'year' && !willCancel && !isPastDue && (
                <Button variant="outline" size="sm" onClick={() => openSwitchPreview('monthly')} disabled={loading !== null || previewLoading}>
                  {previewLoading && switchTarget === 'monthly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Byt till månadskort
                </Button>
              )}
              {willCancel ? (
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
        )
      })()}

      {(() => {
        const credits = subscription.credits
        if (!credits) return null
        const hasUnlimited = subscription.subscribed
        const balance = credits.lead_credits
        const lastPurchase = credits.history[0]
        const fmt = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })

        return (
          <div className="bg-card border rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold">Lead-krediter</h2>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mb-4">
              {hasUnlimited ? (
                <>
                  <span className="text-3xl font-bold">Obegränsat</span>
                  <span className="text-sm text-muted-foreground">
                    så länge ditt {subscription.interval === 'year' ? 'årskort' : 'månadskort'} är aktivt
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">{balance}</span>
                  <span className="text-sm text-muted-foreground">
                    {balance === 1 ? 'lead kvar att låsa upp' : 'leads kvar att låsa upp'}
                  </span>
                </>
              )}
            </div>

            {!hasUnlimited && (
              <p className="text-sm text-muted-foreground mb-3">
                {balance === 0
                  ? 'Du har inga krediter kvar. Köp ett nytt lead nedan – saldot uppdateras direkt efter genomförd betalning.'
                  : 'Krediter läggs till automatiskt direkt efter varje betalning. Ett köp = en lead-kredit.'}
              </p>
            )}

            {credits.history.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Senaste betalningar
                </h3>
                <ul className="divide-y border rounded-lg">
                  {credits.history.slice(0, 5).map((event, idx) => (
                    <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>{fmt(event.date)}</span>
                      <span className="text-muted-foreground">
                        {event.plan === 'monthly' || event.plan === 'yearly'
                          ? `Abonnemang ${event.plan === 'yearly' ? 'årskort' : 'månadskort'}`
                          : `+${event.credits} lead${event.credits === 1 ? '' : 's'}`}
                        {event.amount_sek ? ` · ${Number(event.amount_sek).toLocaleString('sv-SE')} kr` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                {lastPurchase && !hasUnlimited && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Senast uppdaterad: {fmt(lastPurchase.date)}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })()}





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

      <Dialog open={!!switchTarget} onOpenChange={open => { if (!open && !confirmDialog) { setSwitchTarget(null); setSwitchPreview(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {switchTarget === 'yearly' ? 'Byt till årskort' : 'Byt till månadskort'}
            </DialogTitle>
            <DialogDescription>
              Så här ser din nästa faktura ut efter bytet. Ingen dragning sker just nu.
            </DialogDescription>
          </DialogHeader>

          {previewLoading || !switchPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (() => {
            const p = switchPreview
            const kr = (cents: number) => `${(cents / 100).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`
            const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : '–'
            const proration = p.proration_amount
            const newIntervalLabel = p.new_price.interval === 'year' ? '/år' : '/månad'
            return (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nytt pris</span>
                    <span className="font-semibold">{kr(p.new_price.amount)} {newIntervalLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proration (kredit/tillägg)</span>
                    <span className={`font-semibold ${proration < 0 ? 'text-emerald-600' : ''}`}>
                      {proration >= 0 ? '+' : ''}{kr(proration)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Att betala på nästa faktura</span>
                    <span className="font-bold">{kr(p.amount_due)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Nästa dragning</span>
                  <span className="font-medium text-foreground">{fmtDate(p.next_payment_attempt || p.period_end)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {proration < 0
                    ? 'Du får en kredit för oanvänd tid från nuvarande plan. Krediten dras av på nästa faktura.'
                    : 'Mellanskillnaden för nuvarande period läggs till på nästa faktura.'}
                </p>
              </div>
            )
          })()}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setSwitchTarget(null); setSwitchPreview(null) }} disabled={!!confirmDialog}>
              Stäng
            </Button>
            <Button onClick={confirmSwitch} disabled={!switchPreview || !!confirmDialog}>
              Gå vidare till bekräftelse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDialog} onOpenChange={open => { if (!open && !confirmingDialog) setConfirmDialog(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.type === 'cancel' ? 'Bekräfta avbrytande' : 'Bekräfta planbyte'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.type === 'cancel'
                ? 'Är du säker på att du vill avbryta abonnemanget? Du behåller tillgången till periodens slut.'
                : `Är du säker på att du vill byta till ${confirmDialog?.target === 'yearly' ? 'årskort' : 'månadskort'}?`}
            </DialogDescription>
          </DialogHeader>

          {confirmDialog?.type === 'switch' && confirmDialog?.preview && (() => {
            const p = confirmDialog.preview
            const kr = (cents: number) => `${(cents / 100).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`
            const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : '–'
            const proration = p.proration_amount
            const newIntervalLabel = p.new_price.interval === 'year' ? '/år' : '/månad'
            return (
              <div className="rounded-lg border p-3 space-y-2 text-sm mb-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nytt pris</span>
                  <span className="font-semibold">{kr(p.new_price.amount)} {newIntervalLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proration</span>
                  <span className={`font-semibold ${proration < 0 ? 'text-emerald-600' : ''}`}>
                    {proration >= 0 ? '+' : ''}{kr(proration)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Att betala på nästa faktura</span>
                  <span className="font-bold">{kr(p.amount_due)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Nästa dragning</span>
                  <span className="font-medium text-foreground">{fmtDate(p.next_payment_attempt || p.period_end)}</span>
                </div>
              </div>
            )
          })()}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={confirmingDialog}>
              Nej, gå tillbaka
            </Button>
            <Button onClick={executeConfirmedAction} disabled={confirmingDialog}>
              {confirmingDialog && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Ja, {confirmDialog?.type === 'cancel' ? 'avbryt abonnemanget' : 'bekräfta byte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillingPage
