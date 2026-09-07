import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { numWord } from '@/lib/numberWords'

const TrialBanner = () => {
  const { isOnTrial, trialLeadsLeft, trialDaysLeft, trialExpired, isSupplier } = useAuth()
  const location = useLocation()

  if (!isSupplier) return null

  if (trialExpired) {
    // Never cover the billing page with a blocking overlay. An expired supplier
    // must still be able to see the plans and complete a purchase.
    if (location.pathname === '/dashboard/supplier/fakturering') {
      return (
        <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3 bg-orange-50 border border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-900">Din provperiod är slut</p>
            <p className="text-xs text-orange-800">Välj ett enskilt lead eller månadskort nedan för att fortsätta.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="mb-6 rounded-xl border bg-muted/40 p-4" role="note" aria-label="Din provperiod">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="text-sm font-semibold">Din provperiod är slut</h2>
          <p className="mt-1 text-xs text-muted-foreground">Befintliga affärer finns kvar. Välj en plan för nya upplåsningar.</p></div>
          <Button asChild variant="outline" size="sm" className="shrink-0"><Link to="/dashboard/supplier/fakturering">Se priser</Link></Button>
        </div>
      </div>
    )
  }

  if (!isOnTrial) return null

  const urgent = trialLeadsLeft <= 1 || trialDaysLeft <= 3

  return (
    <div className={`rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4 flex-wrap ${urgent ? 'bg-orange-50 border border-orange-200' : 'bg-accent/10 border border-accent/20'}`}>
      <div className="flex items-center gap-2">
        {urgent ? <AlertTriangle className="h-4 w-4 text-orange-600" /> : <Sparkles className="h-4 w-4 text-accent" />}
        <span className={`text-sm font-medium ${urgent ? 'text-orange-800' : 'text-foreground'}`}>
          {urgent ? '⚠️ Nästan slut!' : '🎉 Provperiod aktiv'} · {numWord(trialLeadsLeft)} gratis {trialLeadsLeft === 1 ? 'lead' : 'leads'} kvar · {numWord(trialDaysLeft)} dagar kvar
        </span>
      </div>
      {urgent && (
        <Link to="/dashboard/supplier/fakturering">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">Uppgradera nu</Button>
        </Link>
      )}
    </div>
  )
}

export default TrialBanner
