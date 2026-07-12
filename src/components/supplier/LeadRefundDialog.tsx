import { useState } from 'react'
import { Flag, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { requestLeadRefund, type LeadRefundReason } from '@/lib/marketplaceActions'

const reasons: { value: LeadRefundReason; label: string }[] = [
  { value: 'invalid_contact', label: 'Kontaktuppgifterna är ogiltiga' },
  { value: 'no_response', label: 'Beställaren svarar inte' },
  { value: 'fake_lead', label: 'Förfrågan verkar falsk' },
  { value: 'duplicate', label: 'Uppdraget är en dubblett' },
  { value: 'wrong_scope', label: 'Briefen stämmer inte med verkligt behov' },
  { value: 'other', label: 'Annat problem' },
]

const LeadRefundDialog = ({ projectId }: { projectId: string }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<LeadRefundReason>('invalid_contact')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = async () => {
    if (details.trim().length < 10) {
      toast.error('Beskriv problemet med minst tio tecken.')
      return
    }

    setSubmitting(true)
    try {
      await requestLeadRefund(projectId, reason, details)
      setSubmitted(true)
      toast.success('Begäran har skickats till Updro för granskning.')
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : ''
      if (/redan|pending|open request/i.test(message)) {
        toast.info('Det finns redan en pågående begäran för detta lead.')
      } else if (/window|dagar|expired/i.test(message)) {
        toast.error('Tidsgränsen för att begära kreditprövning har gått ut.')
      } else {
        toast.error(message || 'Kunde inte skicka begäran.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Flag className="h-3.5 w-3.5" /> Rapportera problem med leadet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Begär kreditprövning</DialogTitle>
          <DialogDescription>
            Updro granskar uppgifterna innan en kredit eventuellt återförs. En begäran innebär inte automatisk återbetalning.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-xl bg-primary/10 p-5 text-center">
            <RotateCcw className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold">Begäran är mottagen</p>
            <p className="mt-1 text-sm text-muted-foreground">Du får en notifiering när Updro har granskat ärendet.</p>
            <Button type="button" className="mt-4" onClick={() => setOpen(false)}>Stäng</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Orsak</Label>
              <Select value={reason} onValueChange={value => setReason(value as LeadRefundReason)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reasons.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refund-details">Beskriv vad som har hänt</Label>
              <Textarea
                id="refund-details"
                value={details}
                onChange={event => setDetails(event.target.value)}
                maxLength={1000}
                className="mt-1 min-h-[120px]"
                placeholder="Exempel: Telefonnummer saknas och e-postadressen studsar. Jag försökte kontakta beställaren den 12 och 13 juli."
              />
              <p className="mt-1 text-xs text-muted-foreground">{details.length}/1000 tecken</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Skicka för granskning
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LeadRefundDialog
