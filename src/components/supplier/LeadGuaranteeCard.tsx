import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { LeadRefundReason, requestLeadRefund } from '@/lib/marketplaceActions'

const REASONS: Array<{ value: LeadRefundReason; label: string }> = [
  { value: 'invalid_contact', label: 'Felaktiga kontaktuppgifter' },
  { value: 'no_response', label: 'Kunden svarar inte efter 48 timmar' },
  { value: 'fake_lead', label: 'Falskt uppdrag eller spam' },
  { value: 'duplicate', label: 'Dubblett av ett annat uppdrag' },
  { value: 'wrong_scope', label: 'Uppdraget stämmer inte med beskrivningen' },
  { value: 'other', label: 'Annan anledning' },
]

type GuaranteeRequest = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  credit_refunded: boolean
  admin_note: string | null
}

const LeadGuaranteeCard = ({ projectId }: { projectId: string }) => {
  const [request, setRequest] = useState<GuaranteeRequest | null>(null)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<LeadRefundReason | ''>('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(supabase as any)
      .from('lead_refund_requests')
      .select('id, status, credit_refunded, admin_note')
      .eq('project_id', projectId)
      .maybeSingle()
      .then(({ data, error }: any) => {
        if (!mounted) return
        if (error) console.error('Lead guarantee unavailable', error)
        else setRequest(data || null)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [projectId])

  const submit = async () => {
    if (!reason || details.trim().length < 10) return
    setSubmitting(true)
    try {
      const id = await requestLeadRefund(projectId, reason, details)
      setRequest({ id, status: 'pending', credit_refunded: false, admin_note: null })
      setOpen(false)
      toast.success('Garantiansökan är inskickad.')
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte skicka garantiansökan.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (request) {
    const pending = request.status === 'pending'
    const approved = request.status === 'approved'
    const Icon = pending ? Clock3 : approved ? CheckCircle2 : XCircle
    return (
      <div className={`rounded-xl border p-4 mb-6 ${pending ? 'border-amber-200 bg-amber-50/60' : approved ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{pending ? 'Garantiansökan granskas' : approved ? 'Leadgarantin godkänd' : 'Garantiansökan avslagen'}</p>
            <p className="text-sm mt-1 opacity-75">
              {pending ? 'Vi granskar uppgifterna och återkommer så snart som möjligt.' : approved ? (request.credit_refunded ? 'En lead-kredit har återförts.' : 'Ansökan är godkänd. Upplåsningen ingick i abonnemanget.') : 'Ansökan kunde inte godkännas.'}
            </p>
            {request.admin_note && <p className="text-sm mt-2"><strong>Kommentar:</strong> {request.admin_note}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-950">Updros leadgaranti</p>
            <p className="text-sm text-emerald-900/75 mt-1">Anmäl felaktig kontakt, spam eller uteblivet svar inom sju dagar.</p>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="mt-3 bg-white">Anmäl ogiltigt lead</Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Använd leadgarantin</DialogTitle>
            <DialogDescription>För uteblivet svar behöver minst 48 timmar ha gått sedan upplåsningen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Anledning</Label>
              <Select value={reason} onValueChange={value => setReason(value as LeadRefundReason)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Välj anledning" /></SelectTrigger>
                <SelectContent>{REASONS.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guarantee-details">Beskriv vad som hänt</Label>
              <Textarea id="guarantee-details" value={details} onChange={event => setDetails(event.target.value)} maxLength={1500} className="mt-1 min-h-[110px]" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
              <Button onClick={submit} disabled={submitting || !reason || details.trim().length < 10}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Skicka
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LeadGuaranteeCard
