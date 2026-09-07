import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deliveryPlanText, type DeliveryPlan } from '@/lib/deliveryPlan'

export function DeliveryPlanFields({
  plan,
  onChange,
}: {
  plan: DeliveryPlan
  onChange: (value: DeliveryPlan) => void
}) {
  const id = useId()
  return (
    <fieldset className="space-y-3 rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">
        Leveranser och korrektur
      </legend>
      <p className="text-xs text-muted-foreground">
        Precisera vad som ingår innan båda parter bekräftar.
      </p>
      <div>
        <Label htmlFor={`${id}-items`}>
          Vad ska levereras? En leverans per rad
        </Label>
        <Textarea
          id={`${id}-items`}
          value={plan.deliverables.join('\n')}
          maxLength={4020}
          rows={4}
          placeholder="Exempel: Tre filmer i 9:16, högst 30 sekunder per film"
          onChange={(e) =>
            onChange({ ...plan, deliverables: e.target.value.split('\n') })
          }
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-date`}>Överenskommet leveransdatum</Label>
          <Input
            id={`${id}-date`}
            type="date"
            value={plan.due_date ?? ''}
            onChange={(e) =>
              onChange({ ...plan, due_date: e.target.value || null })
            }
          />
        </div>
        <div>
          <Label htmlFor={`${id}-rounds`}>Korrekturrundor som ingår</Label>
          <Input
            id={`${id}-rounds`}
            type="number"
            min={0}
            max={20}
            placeholder="Ej överenskommet"
            value={plan.revision_rounds ?? ''}
            onChange={(e) =>
              onChange({
                ...plan,
                revision_rounds:
                  e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${id}-acceptance`}>
          Vad behöver vara klart för godkännande?
        </Label>
        <Textarea
          id={`${id}-acceptance`}
          maxLength={2000}
          value={plan.acceptance_criteria}
          onChange={(e) =>
            onChange({ ...plan, acceptance_criteria: e.target.value })
          }
          placeholder="Exempel: Godkänt manus, undertexter och leverans i överenskomna format."
        />
      </div>
    </fieldset>
  )
}

export function DeliveryPlanSummary({ plan }: { plan: DeliveryPlan }) {
  if (
    !plan.deliverables.length &&
    !plan.due_date &&
    plan.revision_rounds === null &&
    !plan.acceptance_criteria
  )
    return null
  return (
    <section
      className="space-y-3 rounded-xl border bg-muted/20 p-4"
      aria-label="Leveransunderlag"
    >
      <h4 className="font-semibold">Leveransunderlag</h4>
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        {plan.deliverables.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Leveransdatum</dt>
          <dd>{plan.due_date ?? 'Ej överenskommet'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Korrekturrundor</dt>
          <dd>{plan.revision_rounds ?? 'Ej överenskommet'}</dd>
        </div>
      </dl>
      {plan.acceptance_criteria && (
        <p className="whitespace-pre-wrap text-sm">
          <strong>Klart när: </strong>
          {plan.acceptance_criteria}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(deliveryPlanText(plan))
            toast.success('Leveransunderlaget kopierat')
          } catch {
            toast.error(
              'Kunde inte kopiera. Markera och kopiera texten i underlaget.'
            )
          }
        }}
      >
        Kopiera leveransunderlag
      </Button>
      <p className="text-xs text-muted-foreground">
        Samla återkopplingen per korrekturrunda. Nya leveranser och tillägg
        behöver en separat överenskommelse.
      </p>
    </section>
  )
}
