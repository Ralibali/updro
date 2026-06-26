import { BadgeCheck, BarChart3, CheckCircle2, Star } from 'lucide-react'
import { formatPrice } from '@/lib/dateUtils'

const paymentLabel = (value: string | null) => {
  if (value === 'hourly') return 'Timpris'
  if (value === 'milestone') return 'Milstolpar'
  return 'Fast pris'
}

const OfferOverview = ({ offers, onShowDetails }: { offers: any[]; onShowDetails: () => void }) => {
  const comparable = offers.filter(offer => offer.status !== 'withdrawn')
  if (comparable.length < 2) return null

  return (
    <section className="rounded-2xl border bg-card overflow-hidden mb-6">
      <div className="p-5 border-b bg-muted/30">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" />Jämför offerterna</h3>
        <p className="text-sm text-muted-foreground mt-1">Pris, leveranstid, betyg och verifieringar på ett ställe.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-muted-foreground font-medium">Byrå</th>
              <th className="p-3 text-left text-muted-foreground font-medium">Pris</th>
              <th className="p-3 text-left text-muted-foreground font-medium">Leveranstid</th>
              <th className="p-3 text-left text-muted-foreground font-medium">Betalning</th>
              <th className="p-3 text-left text-muted-foreground font-medium">Betyg</th>
              <th className="p-3 text-left text-muted-foreground font-medium">Trygghet</th>
            </tr>
          </thead>
          <tbody>
            {comparable.map(offer => {
              const supplier = offer.supplier_profiles || {}
              const name = offer.profiles?.company_name || offer.profiles?.full_name || 'Byrå'
              return (
                <tr key={offer.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-semibold">{name}</td>
                  <td className="p-3 font-semibold text-primary">{formatPrice(offer.price)}</td>
                  <td className="p-3">{offer.delivery_weeks ? `${offer.delivery_weeks} veckor` : 'Diskuteras'}</td>
                  <td className="p-3">{paymentLabel(offer.payment_plan)}</td>
                  <td className="p-3"><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{supplier.avg_rating ? Number(supplier.avg_rating).toFixed(1) : 'Nytt företag'}</span></td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {supplier.is_verified && <BadgeCheck className="h-4 w-4 text-emerald-700" aria-label="Verifierad byrå" />}
                      {supplier.has_fskatt && <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-label="F-skatt verifierad" />}
                      {supplier.credit_check_passed && <span className="text-xs text-emerald-700">Kreditkontrollerad</span>}
                      {!supplier.is_verified && !supplier.has_fskatt && !supplier.credit_check_passed && <span className="text-muted-foreground">Grundprofil</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t">
        <button onClick={onShowDetails} className="text-sm font-semibold text-primary hover:underline">Läs fullständiga offerter och välj byrå →</button>
      </div>
    </section>
  )
}

export default OfferOverview
