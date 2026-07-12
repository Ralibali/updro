import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/dateUtils'
import { trackAnalyticsEvent } from '@/lib/analytics'
import {
  MAX_COMMENT_LENGTH,
  OUTCOME_LABELS,
  PROJECT_OUTCOMES,
  type ProjectOutcome,
  validateOutcomeForm,
} from '@/lib/projectOutcomes'

type OfferForOutcome = {
  id: string
  price: number | string | null
  profiles?: { company_name: string | null; full_name: string | null } | null
}

type Props = {
  projectId: string
  buyerId: string | null | undefined
  offers: OfferForOutcome[]
}

type ExistingOutcome = {
  outcome: ProjectOutcome
  selected_offer_id: string | null
  actual_value_sek: number | null
  comment: string | null
  updated_at: string
}

const outcomeIcon = (o: ProjectOutcome) =>
  o === 'hired' ? CheckCircle2 : o === 'still_deciding' ? Clock : XCircle

const ProjectOutcomeCard = ({ projectId, buyerId, offers }: Props) => {
  const offerIds = useMemo(() => offers.map(o => o.id), [offers])
  const [existing, setExisting] = useState<ExistingOutcome | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [outcome, setOutcome] = useState<ProjectOutcome | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [actualValueSek, setActualValueSek] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('project_outcomes')
        .select('outcome, selected_offer_id, actual_value_sek, comment, updated_at')
        .eq('project_id', projectId)
        .maybeSingle()
      if (cancelled) return
      if (data) {
        const row: ExistingOutcome = {
          outcome: data.outcome as ProjectOutcome,
          selected_offer_id: data.selected_offer_id,
          actual_value_sek: data.actual_value_sek,
          comment: data.comment,
          updated_at: data.updated_at,
        }
        setExisting(row)
        setOutcome(row.outcome)
        setSelectedOfferId(row.selected_offer_id)
        setActualValueSek(row.actual_value_sek != null ? String(row.actual_value_sek) : '')
        setComment(row.comment ?? '')
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [projectId])

  if (!buyerId) return null
  if (offers.length === 0) return null

  const supplierName = (o: OfferForOutcome) =>
    o.profiles?.company_name || o.profiles?.full_name || 'Byrå'

  const handleSubmit = async () => {
    const result = validateOutcomeForm(
      { outcome, selectedOfferId, actualValueSek, comment },
      offerIds,
    )
    if (!result.ok) {
      toast.error(result.error)
      return
    }
      return
    }
    setSubmitting(true)
    const { data, error } = await supabase.rpc('report_project_outcome', {
      p_project_id: projectId,
      p_outcome: result.value.outcome,
      p_selected_offer_id: result.value.selectedOfferId ?? undefined,
      p_actual_value_sek: result.value.actualValueSek ?? undefined,
      p_comment: result.value.comment ?? undefined,
    })
    setSubmitting(false)
    if (error || !data) {
      toast.error('Kunde inte spara utfallet. Försök igen.')
      return
    }
    const saved: ExistingOutcome = {
      outcome: data.outcome as ProjectOutcome,
      selected_offer_id: data.selected_offer_id,
      actual_value_sek: data.actual_value_sek,
      comment: data.comment,
      updated_at: data.updated_at,
    }
    setExisting(saved)
    setEditing(false)
    trackAnalyticsEvent('project_outcome_reported', {
      outcome: saved.outcome,
      project_id: projectId,
    })
    toast.success(existing ? 'Utfall uppdaterat.' : 'Tack för din återkoppling!')
  }

  if (loading) {
    return <div className="animate-pulse h-24 bg-muted rounded-xl mb-6" />
  }

  if (existing && !editing) {
    const Icon = outcomeIcon(existing.outcome)
    const chosenOffer = offers.find(o => o.id === existing.selected_offer_id)
    return (
      <div className="bg-card rounded-xl border p-5 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Rapporterat utfall</h3>
              <p className="text-sm text-muted-foreground mt-1">{OUTCOME_LABELS[existing.outcome]}</p>
              {chosenOffer && (
                <p className="text-xs text-muted-foreground mt-1">Vald byrå: {supplierName(chosenOffer)}</p>
              )}
              {existing.actual_value_sek != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Affärsvärde: {formatPrice(existing.actual_value_sek)}
                </p>
              )}
              {existing.comment && (
                <p className="text-xs text-muted-foreground mt-2 italic whitespace-pre-wrap">"{existing.comment}"</p>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Uppdatera</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-5 mb-6">
      <h3 className="font-semibold">Vad hände med uppdraget?</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Din återkoppling hjälper oss att förbättra matchningen. Delas aldrig publikt.
      </p>

      <div className="grid gap-2 mt-4 sm:grid-cols-3">
        {PROJECT_OUTCOMES.map(o => {
          const Icon = outcomeIcon(o)
          const active = outcome === o
          return (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="mt-2 text-sm font-medium">{OUTCOME_LABELS[o]}</p>
            </button>
          )
        })}
      </div>

      {outcome === 'hired' && (
        <div className="mt-4">
          <label className="text-xs font-semibold text-muted-foreground">Vilken byrå anlitade ni?</label>
          <div className="mt-2 space-y-2">
            {offers.map(o => {
              const active = selectedOfferId === o.id
              const priceNum = typeof o.price === 'string' ? Number(o.price) : o.price
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedOfferId(o.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{supplierName(o)}</span>
                    {priceNum != null && Number.isFinite(priceNum) && (
                      <span className="text-xs text-muted-foreground">{formatPrice(priceNum)}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {outcome && (
        <>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="outcome-value">
              Affärsvärde (SEK) – frivilligt
            </label>
            <input
              id="outcome-value"
              type="text"
              inputMode="decimal"
              value={actualValueSek}
              onChange={e => setActualValueSek(e.target.value)}
              placeholder="t.ex. 75 000"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="outcome-comment">
              Kommentar – frivilligt
            </label>
            <textarea
              id="outcome-comment"
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Vad var avgörande i beslutet?"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{comment.length}/{MAX_COMMENT_LENGTH}</p>
          </div>
        </>
      )}

      <div className="flex gap-2 mt-4">
        <Button onClick={handleSubmit} disabled={submitting || !outcome}>
          {submitting ? 'Sparar…' : existing ? 'Uppdatera utfall' : 'Spara utfall'}
        </Button>
        {existing && (
          <Button variant="outline" onClick={() => setEditing(false)} disabled={submitting}>Avbryt</Button>
        )}
      </div>
    </div>
  )
}

export default ProjectOutcomeCard
