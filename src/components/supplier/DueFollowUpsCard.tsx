import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/dateUtils'
import {
  getDueFollowUps,
  nextFollowUpMorningIso,
  type DueFollowUpItem,
  type SupplierOfferFollowUp,
  type SupplierPipelineOffer,
} from '@/lib/supplierSalesPipeline'

/**
 * Visar förfallna säljuppföljningar på byråns översikt så att planerade
 * återkontakter inte faller mellan stolarna. Läser bara byråns egna rader
 * (RLS) och rör aldrig beställarens data.
 */
const DueFollowUpsCard = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<DueFollowUpItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const [followUpResult, offerResult] = await Promise.all([
        supabase
          .from('supplier_offer_followups')
          .select('*')
          .eq('supplier_id', user.id)
          .not('follow_up_at', 'is', null),
        supabase
          .from('offers')
          .select('id, title, status, price, payment_plan, project_id')
          .eq('supplier_id', user.id)
          .in('status', ['pending', 'accepted']),
      ])
      if (followUpResult.error) throw followUpResult.error
      if (offerResult.error) throw offerResult.error
      setItems(getDueFollowUps(
        (followUpResult.data || []) as SupplierOfferFollowUp[],
        (offerResult.data || []) as SupplierPipelineOffer[],
        user.id,
      ))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { void load() }, [load])

  const updateFollowUpAt = async (offerId: string, followUpAt: string | null, doneLabel: string) => {
    if (!user) return
    setBusyOfferId(offerId)
    try {
      const { error: updateError } = await supabase
        .from('supplier_offer_followups')
        .update({ follow_up_at: followUpAt, updated_at: new Date().toISOString() })
        .eq('offer_id', offerId)
        .eq('supplier_id', user.id)
      if (updateError) throw updateError
      setItems(current => current.filter(item => item.followUp.offer_id !== offerId))
      toast.success(doneLabel)
    } catch {
      toast.error('Ändringen kunde inte sparas. Försök igen.')
    } finally {
      setBusyOfferId(null)
    }
  }

  if (loading) return null
  if (error) {
    return (
      <section aria-label="Uppföljningar att göra" className="rounded-xl border bg-card p-5">
        <p className="text-sm">Uppföljningarna kunde inte hämtas.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>Försök igen</Button>
      </section>
    )
  }
  if (items.length === 0) return null

  return (
    <section aria-label="Uppföljningar att göra" className="rounded-xl border border-amber-300 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-950/30">
      <h2 className="flex items-center gap-2 font-display font-semibold">
        <CalendarClock className="h-4 w-4 text-amber-600" />
        Följ upp dina offerter
        <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">{items.length}</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Du har planerat återkontakt för {items.length === 1 ? 'den här offerten' : 'de här offerterna'}. En kort påminnelse höjer chansen att få svar.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map(({ followUp, offer }) => (
          <li key={followUp.offer_id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 basis-52">
                <Link
                  to={`/dashboard/supplier/offerter#offer-${followUp.offer_id}`}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {offer.title || 'Offert'} <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
                {followUp.next_action && (
                  <p className="mt-1 text-sm text-muted-foreground break-words">{followUp.next_action}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Planerad {timeAgo(followUp.follow_up_at || '')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyOfferId === followUp.offer_id}
                  onClick={() => void updateFollowUpAt(followUp.offer_id, nextFollowUpMorningIso(), 'Uppföljningen flyttades till i morgon.')}
                >
                  Planera om
                </Button>
                <Button
                  size="sm"
                  disabled={busyOfferId === followUp.offer_id}
                  onClick={() => void updateFollowUpAt(followUp.offer_id, null, 'Snyggt! Uppföljningen är markerad som klar.')}
                >
                  <Check className="mr-1 h-4 w-4" /> Markera klar
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DueFollowUpsCard
