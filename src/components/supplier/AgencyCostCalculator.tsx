import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { STRIPE_PRODUCTS } from '@/lib/constants'
import { compareCostPerWin, PARTNA_FACTS, PARTNA_VERIFIED_DATE } from '@/lib/partnaComparison'
import { trackClick } from '@/hooks/usePageTracking'

const kr = (value: number) => `${Math.round(value).toLocaleString('sv-SE')} kr`

interface AgencyCostCalculatorProps {
  onSignup?: () => void
}

/** Interaktiv jämförelse av kostnad per vunnen affär för byråer. */
const AgencyCostCalculator = ({ onSignup }: AgencyCostCalculatorProps) => {
  const [projectValue, setProjectValue] = useState(80000)
  const [leadsPerWin, setLeadsPerWin] = useState(4)

  const result = useMemo(
    () => compareCostPerWin({ projectValue, leadsPerWin, updroLeadPrice: STRIPE_PRODUCTS.lead.price }),
    [projectValue, leadsPerWin],
  )
  const updroShare = result.partna > 0 ? Math.max(4, (result.updro / result.partna) * 100) : 100

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-md">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label id="calc-value-label" className="text-sm font-semibold">Typiskt projektvärde</label>
            <span className="font-display text-lg font-bold tabular-nums">{kr(projectValue)}</span>
          </div>
          <Slider
            aria-labelledby="calc-value-label"
            className="mt-3"
            min={10000}
            max={400000}
            step={5000}
            value={[projectValue]}
            onValueChange={([value]) => setProjectValue(value)}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label id="calc-leads-label" className="text-sm font-semibold">Leads ni behöver per vunnen affär</label>
            <span className="font-display text-lg font-bold tabular-nums">{leadsPerWin}</span>
          </div>
          <Slider
            aria-labelledby="calc-leads-label"
            className="mt-3"
            min={1}
            max={15}
            step={1}
            value={[leadsPerWin]}
            onValueChange={([value]) => setLeadsPerWin(value)}
          />
        </div>
      </div>

      <div className="mt-8 space-y-4" aria-live="polite">
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-foreground">Updro</span>
            <span className="font-display text-xl font-bold tabular-nums text-primary">{kr(result.updro)}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${updroShare}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{leadsPerWin} × {STRIPE_PRODUCTS.lead.price} kr · 0 % provision</p>
        </div>
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-muted-foreground">Partna Pay as you go</span>
            <span className="font-display text-xl font-bold tabular-nums text-muted-foreground">{kr(result.partna)}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full rounded-full bg-muted-foreground/40" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {leadsPerWin} × {PARTNA_FACTS.payAsYouGo} kr + {Math.round(PARTNA_FACTS.successFeeRate * 100)} % slagavgift ({kr(result.partnaFee)})
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-primary/5 border border-primary/15 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ni sparar per vunnen affär jämfört med Partna</p>
        <p className="mt-1 font-display text-4xl font-bold tabular-nums text-foreground">{kr(result.savings)}</p>
        <Link
          to="/registrera/byra"
          onClick={() => {
            trackClick('supplier_calculator_cta', 'Starta med gratis leads', { project_value: projectValue, leads_per_win: leadsPerWin })
            onSignup?.()
          }}
        >
          <Button size="lg" className="mt-4 w-full sm:w-auto rounded-xl">
            Starta med gratis leads <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Räkneexempel med publika listpriser (Partna kontrollerat {PARTNA_VERIFIED_DATE}), exkl. moms. Partnas månadsplaner har
        andra villkor. Faktisk konvertering varierar.{' '}
        <Link to="/partna-alternativ" className="underline underline-offset-2">Se källor</Link>
      </p>
    </div>
  )
}

export default AgencyCostCalculator
