import { useRef, useState } from 'react'
import { closeProjectWithoutOffer } from '@/lib/marketplaceActions'
import { toast } from 'sonner'

interface BuyerDecisionCardProps {
  project: any
  offers: any[]
  onScrollToOffers: () => void
  onProjectClosed: () => void
}

function getDaysSince(dateStr: string | null) {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

const BuyerDecisionCard = ({ project, offers, onScrollToOffers, onProjectClosed }: BuyerDecisionCardProps) => {
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)
  const pendingOffers = offers.filter(o => o.status === 'pending')
  const hasAccepted = offers.some(o => o.status === 'accepted')
  const firstOfferDate = offers.length > 0 ? offers[offers.length - 1]?.created_at : null
  const daysSinceFirstOffer = getDaysSince(firstOfferDate)

  if (pendingOffers.length === 0 || hasAccepted || daysSinceFirstOffer < 3) return null

  const handleClose = async (reason: 'external' | 'cancelled') => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    try {
      await closeProjectWithoutOffer(project.id)
      toast.success(reason === 'external' ? 'Uppdraget markerat som avslutat' : 'Uppdraget har avslutats')
      onProjectClosed()
    } catch (cause) {
      toast.error((cause as { message?: string })?.message || 'Kunde inte stänga uppdraget. Försök igen.')
    } finally {
      closingRef.current = false
      setClosing(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
      <h4 className="font-bold text-foreground mb-1">
        Har du bestämt dig? 🤔
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        Du har fått {offers.length} {offers.length === 1 ? 'intresserad byrå' : 'intresserade byråer'}. Meddela byråerna ditt beslut
        så slipper de vänta i onödan.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={onScrollToOffers}
          className="text-left text-sm font-semibold text-primary hover:underline flex items-center gap-2"
        >
          ✅ Välj en byrå att gå vidare med
        </button>
        <button
          disabled={closing}
          onClick={() => handleClose('external')}
          className="text-left text-sm font-semibold text-primary hover:underline flex items-center gap-2"
        >
          🔄 Jag valde ett företag utanför Updro
        </button>
        <button
          disabled={closing}
          onClick={() => handleClose('cancelled')}
          className="text-left text-sm font-semibold text-muted-foreground hover:underline flex items-center gap-2"
        >
          ❌ Uppdraget kommer inte att utföras
        </button>
      </div>
    </div>
  )
}

export default BuyerDecisionCard
