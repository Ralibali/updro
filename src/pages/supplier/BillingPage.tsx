import { useAuth } from '@/hooks/useAuth'
import TrialBanner from '@/components/TrialBanner'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, TRIAL_LEADS } from '@/lib/constants'
import { numWord } from '@/lib/numberWords'
import { toast } from 'sonner'

const BillingPage = () => {
  const { supplierProfile, isOnTrial, trialLeadsLeft, trialDaysLeft } = useAuth()

  const handleSelectPlan = (planId: string) => {
    toast.info('Stripe-integration aktiveras snart. Kontakta oss för att uppgradera!')
  }

  return (
    <div className="max-w-4xl">
      <TrialBanner />

      <h1 className="font-display text-2xl font-bold mb-6">Abonnemang & betalning</h1>

      {/* Current plan */}
      {isOnTrial && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="font-display font-semibold">Provperiod aktiv</h3>
          </div>
          <p className="text-sm text-muted-foreground">{numWord(trialLeadsLeft)} av {numWord(TRIAL_LEADS)} gratis leads kvar · {numWord(trialDaysLeft)} dagar kvar</p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: TRIAL_LEADS }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < (TRIAL_LEADS - trialLeadsLeft) ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-card rounded-2xl border p-6 relative ${plan.highlighted ? 'border-primary shadow-md ring-2 ring-primary/20' : ''}`}>
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-3 py-1">
                {'badge' in plan ? plan.badge : ''}
              </span>
            )}
            <h3 className="font-display font-bold text-lg">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">{plan.price.toLocaleString('sv-SE')}</span>
              <span className="text-sm text-muted-foreground ml-1">kr {plan.per}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full mt-6 rounded-xl ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : 'bg-card border border-primary text-primary hover:bg-primary/5'}`}
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BillingPage
