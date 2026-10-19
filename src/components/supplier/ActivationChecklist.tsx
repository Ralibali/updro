import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, CircleDashed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useSupplierActivation } from '@/hooks/useSupplierActivation'
import {
  trackSupplierActivationCompleted,
  trackSupplierActivationStepCompleted,
  trackSupplierActivationViewed,
} from '@/lib/analytics'

/**
 * Aurora Activate v1: permanent aktiveringschecklista på byråns översikt.
 * Stegen härleds från verklig data (profil, uppdragsvisning, upplåsta leads,
 * offerter). Frivilliga steg är markerade så att inget köp krävs för att de
 * obligatoriska stegen ska gå i mål.
 */
const ActivationChecklist = () => {
  const { supplierProfile, isOnTrial, trialLeadsLeft, trialDaysLeft, hasActiveSubscription } = useAuth()
  const { steps, completedRequired, requiredTotal, nextStep, allRequiredDone, allDone, loading } = useSupplierActivation()
  const trackedSteps = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!supplierProfile || !steps.length) return
    trackSupplierActivationViewed()
    for (const step of steps) {
      if (step.done && !trackedSteps.current.has(step.id)) {
        trackedSteps.current.add(step.id)
        trackSupplierActivationStepCompleted(step.id)
      }
    }
    if (allRequiredDone) trackSupplierActivationCompleted()
  }, [supplierProfile, steps, allRequiredDone])

  if (!supplierProfile || !steps.length) return null

  const doneCount = steps.filter(s => s.done).length
  const progressPct = Math.round((doneCount / steps.length) * 100)

  const planLine = hasActiveSubscription
    ? 'Månadskort aktivt – obegränsade upplåsningar ingår.'
    : isOnTrial
      ? `Provperiod: ${trialLeadsLeft} ${trialLeadsLeft === 1 ? 'gratis lead' : 'gratis leads'} kvar, ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dag' : 'dagar'} kvar.`
      : `${supplierProfile.lead_credits ?? 0} ${(supplierProfile.lead_credits ?? 0) === 1 ? 'upplåsningskredit' : 'upplåsningskrediter'} kvar.`

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Kom igång med Updro">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display font-semibold">
            {allDone ? 'Klart – byrån är igång' : allRequiredDone ? 'Bra jobbat – grunden är klar' : 'Kom igång med Updro'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {allDone
              ? 'Alla steg är avklarade. Nya uppdrag matchas löpande mot era kategorier.'
              : nextStep
                ? <>Nästa steg: {nextStep.title.toLocaleLowerCase('sv-SE')}.</>
                : null}
          </p>
        </div>
        {nextStep && (
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link to={nextStep.href}>{nextStep.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        )}
      </div>

      <div className="mt-3" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${doneCount} av ${steps.length} steg klara`}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{doneCount} av {steps.length} steg klara · {completedRequired} av {requiredTotal} obligatoriska</p>
      </div>

      <details className="mt-3 text-sm" open={!allRequiredDone}>
        <summary className="cursor-pointer text-muted-foreground">
          {allDone ? 'Visa checklistan' : 'Visa alla steg'}
        </summary>
        <ul className="mt-3 space-y-2">
          {steps.map(step => (
            <li key={step.id} className="flex items-start gap-2">
              {step.done
                ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Klart" />
                : <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-label="Återstår" />}
              <div className="min-w-0">
                <span className={step.done ? 'text-muted-foreground' : 'font-medium'}>
                  {step.title}
                  {step.optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(frivilligt)</span>}
                </span>
                {!step.done && (
                  <p className="text-xs text-muted-foreground">
                    {step.description}{' '}
                    <Link to={step.href} className="font-medium text-primary hover:underline">{step.cta}</Link>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
        {loading ? 'Hämtar din status…' : planLine}{' '}
        Upplåsning visar beställarens kontaktuppgifter; offert skickar du efter upplåsning.{' '}
        <Link to="/dashboard/supplier/fakturering" className="font-medium text-primary hover:underline">Se betalplan</Link>
      </p>
    </section>
  )
}

export default ActivationChecklist
