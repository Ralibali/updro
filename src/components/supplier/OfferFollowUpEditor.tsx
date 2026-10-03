import { useEffect, useState } from 'react'
import { CalendarClock, LockKeyhole, Save } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  isSupplierFollowUpDue,
  toSupplierDateTimeInput,
  type SupplierOfferFollowUp,
} from '@/lib/supplierSalesPipeline'

type Props = {
  offerId: string
  supplierId: string
  followUp?: SupplierOfferFollowUp
  onSaved: (followUp: SupplierOfferFollowUp | null) => void
}

export default function OfferFollowUpEditor({
  offerId,
  supplierId,
  followUp,
  onSaved,
}: Props) {
  const [nextAction, setNextAction] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')
  const [privateNote, setPrivateNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNextAction(followUp?.next_action ?? '')
    setFollowUpAt(toSupplierDateTimeInput(followUp?.follow_up_at))
    setPrivateNote(followUp?.private_note ?? '')
  }, [followUp])

  const save = async () => {
    const action = nextAction.trim()
    const note = privateNote.trim()
    if (action.length > 500) {
      toast.error('Nästa åtgärd får vara högst 500 tecken.')
      return
    }
    if (note.length > 4000) {
      toast.error('Den privata noteringen får vara högst 4 000 tecken.')
      return
    }

    setSaving(true)
    try {
      if (!action && !followUpAt && !note) {
        if (followUp) {
          const { error } = await supabase
            .from('supplier_offer_followups')
            .delete()
            .eq('offer_id', offerId)
            .eq('supplier_id', supplierId)
          if (error) throw error
        }
        onSaved(null)
        toast.success('Säljplanen är rensad.')
        return
      }

      const { data, error } = await supabase
        .from('supplier_offer_followups')
        .upsert({
          offer_id: offerId,
          supplier_id: supplierId,
          next_action: action || null,
          follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
          private_note: note || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'offer_id' })
        .select('*')
        .single()

      if (error) throw error
      onSaved(data)
      toast.success('Säljplanen är sparad.')
    } catch (error) {
      console.error(error)
      toast.error('Säljplanen kunde inte sparas.')
    } finally {
      setSaving(false)
    }
  }

  const due = isSupplierFollowUpDue(followUp?.follow_up_at)

  return (
    <details className="mt-4 rounded-xl border bg-muted/20 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Privat säljplan</span>
          <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />
          {due && <Badge variant="destructive">Följ upp nu</Badge>}
          {!due && followUp?.follow_up_at && <Badge variant="secondary"><CalendarClock className="mr-1 h-3 w-3" />Planerad</Badge>}
          <span className="text-xs text-muted-foreground">syns bara för din byrå</span>
        </div>
        {followUp?.next_action && <p className="mt-1 text-sm text-muted-foreground">{followUp.next_action}</p>}
      </summary>

      <div className="mt-4 grid gap-3">
        <div>
          <Label htmlFor={`next-action-${offerId}`}>Nästa åtgärd</Label>
          <Input
            id={`next-action-${offerId}`}
            value={nextAction}
            maxLength={500}
            placeholder="t.ex. Ring på torsdag efter deras interna möte"
            onChange={event => setNextAction(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`follow-up-${offerId}`}>Följ upp</Label>
          <Input
            id={`follow-up-${offerId}`}
            type="datetime-local"
            value={followUpAt}
            onChange={event => setFollowUpAt(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`private-note-${offerId}`}>Privat notering</Label>
          <Textarea
            id={`private-note-${offerId}`}
            value={privateNote}
            rows={3}
            maxLength={4000}
            placeholder="Beslutsprocess, invändningar, vem som behöver återkopplas…"
            onChange={event => setPrivateNote(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">Beställaren kan inte läsa detta.</p>
          <Button size="sm" onClick={() => void save()} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />{saving ? 'Sparar…' : 'Spara säljplan'}
          </Button>
        </div>
      </div>
    </details>
  )
}
