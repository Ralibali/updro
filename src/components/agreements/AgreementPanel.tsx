import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, FileSignature, Loader2, PenLine, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/dateUtils'
import { AGREEMENT_STATUS_LABELS, PAYMENT_PLAN_LABELS, STANDARD_CLAUSES, agreementStatus } from '@/lib/agreements'
import { deliveryPlanText, emptyDeliveryPlan, parseDeliveryPlan } from '@/lib/deliveryPlan'
import { DeliveryPlanFields, DeliveryPlanSummary } from './DeliveryPlanFields'
import { getProjectAgreement, updateProjectAgreement, type AgreementContext, type AgreementRow } from '@/lib/agreementActions'

interface AgreementPanelProps { projectId: string; offerId: string; role: 'buyer' | 'supplier' }
const formatDateTime = (iso: string) => new Date(iso).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' })

const AgreementPanel = ({ projectId, offerId, role }: AgreementPanelProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const requestId = useRef(0)
  const [error, setError] = useState<string | null>(null)
  const [agreement, setAgreement] = useState<AgreementRow | null>(null)
  const [context, setContext] = useState<AgreementContext | null>(null)
  const [editing, setEditing] = useState(false)
  const [consent, setConsent] = useState(false)
  const [scopeDraft, setScopeDraft] = useState('')
  const [termsDraft, setTermsDraft] = useState('')
  const [deliveryDraft, setDeliveryDraft] = useState(emptyDeliveryPlan)
  const isBuyer = role === 'buyer'
  const content = agreement?.content
  const status = content ? agreementStatus(content) : null

  const load = useCallback(async () => {
    const current = ++requestId.current
    setLoading(true)
    setError(null)
    setConsent(false)
    try {
      const result = await getProjectAgreement(projectId, offerId)
      if (current !== requestId.current) return
      setContext(result.context)
      setAgreement(result.agreement)
      setEditing(false)
    } catch (cause) {
      if (current === requestId.current) setError(cause instanceof Error ? cause.message : 'Avtalet kunde inte läsas. Försök igen.')
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }, [projectId, offerId])

  const cancelPendingLoad = useCallback(() => { requestId.current++ }, [])
  useEffect(() => { void load(); return cancelPendingLoad }, [load, cancelPendingLoad])

  const save = async (action: 'create' | 'edit' | 'confirm') => {
    if (savingRef.current || (action === 'confirm' && !consent)) return
    const plan = action === 'edit' ? parseDeliveryPlan({ ...deliveryDraft, deliverables: deliveryDraft.deliverables.map(item => item.trim()).filter(Boolean) }) : null
    if (action === 'edit' && !plan) { toast.error('Kontrollera leveranserna: högst 20 rader med 200 tecken, giltigt datum och 0–20 korrekturrundor.'); return }
    savingRef.current = true
    setSaving(true)
    setError(null)
    try {
      const row = await updateProjectAgreement(offerId, action, agreement?.revision ?? 0,
        action === 'edit' ? { scope: scopeDraft.trim(), special_terms: termsDraft.trim(), delivery_plan: plan! } : undefined)
      setAgreement(row)
      setEditing(false)
      setConsent(false)
      toast.success(action === 'create' ? 'Avtalsutkast sparat. Granska villkoren.' : action === 'edit'
        ? 'Ändringarna är sparade. Båda parter behöver bekräfta den nya versionen.'
        : isBuyer ? 'Din bekräftelse är sparad. Byrån har fått en notis.' : 'Båda parter har bekräftat. Avtalet är låst.')
    } catch (cause) {
      const message = typeof (cause as { message?: unknown })?.message === 'string'
        ? (cause as { message: string }).message : 'Ändringen kunde inte bekräftas. Läs senaste versionen innan du försöker igen.'
      setError(message)
      toast.error(message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const download = () => {
    if (!content || !agreement) return
    const text = [
      `Samarbetsavtal – ${content.project_title}`, `Avtals-ID: ${agreement.id} · Version: ${agreement.revision}`,
      `Status: ${AGREEMENT_STATUS_LABELS[agreementStatus(content)]}`,
      `Parter: ${content.buyer_name} och ${content.supplier_name}`,
      `Pris: ${formatPrice(content.price_sek)}${content.payment_plan === 'hourly' ? '/timme' : ''} exkl. moms`,
      `Betalningsmodell: ${PAYMENT_PLAN_LABELS[content.payment_plan || 'fixed']}`,
      `Tidsplan: ${content.delivery_weeks ? `${content.delivery_weeks} veckor` : 'Enligt dialog'}`,
      '\nOmfattning', content.scope, '\nSärskilda villkor', content.special_terms || 'Inga tillägg.',
      '\n' + deliveryPlanText(content.delivery_plan ?? emptyDeliveryPlan()),
      '\nStandardvillkor', ...(content.standard_clauses ?? STANDARD_CLAUSES),
      `\nBeställarens bekräftelse: ${content.buyer_confirmed_at ?? 'Saknas'}`,
      `Byråns bekräftelse: ${content.supplier_confirmed_at ?? 'Saknas'}`,
      'Bekräftelserna har gjorts med parternas inloggade Updro-konton. Ingen BankID-signering.',
    ].join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `updro-avtal-${agreement.id}-v${agreement.revision}.txt`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (loading) return <div className="mt-4 flex items-center gap-2 rounded-xl border p-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Laddar samarbetsavtal…</div>

  return (
    <section className="mt-4 rounded-xl border bg-card p-4 sm:p-5" aria-label="Samarbetsavtal">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display font-semibold"><FileSignature className="h-5 w-5 text-primary" />Samarbetsavtal</h3>
        {status && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'signed' ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{AGREEMENT_STATUS_LABELS[status]}</span>}
      </header>
      {error && <div role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <p>{error}</p><Button variant="outline" size="sm" onClick={load} disabled={saving} className="mt-2">Läs senaste versionen</Button>
      </div>}
      {context && !content && <div className="mt-3 space-y-3 text-sm text-muted-foreground">
        <p>{isBuyer ? `Dokumentera överenskommelsen med ${context.supplierName}. Hela offertbeskrivningen, priset och tidsplanen hämtas till ett utkast som du kan granska.` : 'Beställaren skapar avtalsutkastet. Du får en notis i Updro när det är din tur att granska och bekräfta.'}</p>
        {isBuyer && <Button onClick={() => save('create')} disabled={saving || !!error}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Skapa avtalsutkast</Button>}
      </div>}
      {content && agreement && <div className="mt-4 space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3"><dt className="text-xs text-muted-foreground">{content.payment_plan === 'hourly' ? 'Timpris' : 'Pris'}</dt>
            <dd className="mt-1 font-semibold">{formatPrice(content.price_sek)}{content.payment_plan === 'hourly' ? '/timme' : ''}</dd>
            <dd className="text-xs text-muted-foreground">Exkl. moms · {PAYMENT_PLAN_LABELS[content.payment_plan || 'fixed']}</dd></div>
          <div className="rounded-lg bg-muted/40 p-3"><dt className="text-xs text-muted-foreground">Tidsplan</dt><dd className="mt-1 font-semibold">{content.delivery_weeks ? `${content.delivery_weeks} veckor` : 'Enligt dialog'}</dd></div>
          <div className="rounded-lg bg-muted/40 p-3"><dt className="text-xs text-muted-foreground">Parter</dt><dd className="mt-1 font-semibold break-words">{content.buyer_name}</dd><dd className="break-words">{content.supplier_name}</dd></div>
        </dl>
        {editing ? <div className="space-y-3">
          <div><Label htmlFor={`scope-${offerId}`}>Omfattning</Label><Textarea id={`scope-${offerId}`} value={scopeDraft} onChange={e => setScopeDraft(e.target.value)} maxLength={30000} className="mt-1 min-h-[160px]" /></div>
          <div><Label htmlFor={`terms-${offerId}`}>Särskilda villkor</Label><Textarea id={`terms-${offerId}`} value={termsDraft} onChange={e => setTermsDraft(e.target.value)} maxLength={10000} className="mt-1 min-h-[100px]" /></div>
          <DeliveryPlanFields plan={deliveryDraft} onChange={setDeliveryDraft} />
          <p className="text-xs text-muted-foreground">Ändringar skapar en ny version och nollställer tidigare bekräftelser.</p>
          <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => save('edit')} disabled={saving || !!error || scopeDraft.trim().length < 3}>Spara ändringar</Button><Button size="sm" variant="outline" disabled={saving} onClick={() => setEditing(false)}>Avbryt</Button></div>
        </div> : <>
          <div><h4 className="text-sm font-semibold">Omfattning</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm">{content.scope}</p></div>
          {content.special_terms && <div><h4 className="text-sm font-semibold">Särskilda villkor</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm">{content.special_terms}</p></div>}
          <DeliveryPlanSummary plan={content.delivery_plan ?? emptyDeliveryPlan()} />
          <div><h4 className="text-sm font-semibold">Standardvillkor</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{(content.standard_clauses ?? STANDARD_CLAUSES).map(clause => <li key={clause}>{clause}</li>)}</ul></div>
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
            <p>Version {agreement.revision} · Skapat {formatDateTime(content.created_at)}</p>
            <p>{content.buyer_confirmed_at ? `✓ ${content.buyer_name} bekräftade ${formatDateTime(content.buyer_confirmed_at)}` : 'Beställaren har inte bekräftat ännu.'}</p>
            <p>{content.supplier_confirmed_at ? `✓ ${content.supplier_name} bekräftade ${formatDateTime(content.supplier_confirmed_at)}` : 'Byrån har inte bekräftat ännu.'}</p>
            <p>Bekräftelsen görs med ditt inloggade Updro-konto. Ingen BankID-signering ingår.</p>
          </div>
          {((isBuyer && status === 'draft') || (!isBuyer && status === 'awaiting_supplier')) && <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={saving} /><span>Jag har läst version {agreement.revision} och bekräftar omfattning, pris och villkor för {isBuyer ? content.buyer_name : content.supplier_name}.</span></label>
            <Button onClick={() => save('confirm')} disabled={saving || !consent || !!error} className="h-auto min-h-10 w-full whitespace-normal sm:w-auto">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isBuyer ? 'Bekräfta och skicka till byrån' : 'Bekräfta samarbetsavtalet'}</Button>
          </div>}
          {status === 'signed' && <p className="flex items-start gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck className="h-5 w-5 shrink-0" />Avtalet är låst. Kontakta varandra vid behov av ett nytt eller kompletterande avtal.</p>}
          <div className="flex flex-wrap gap-2">
            {isBuyer && status !== 'signed' && <Button size="sm" variant="outline" disabled={saving || !!error} onClick={() => { setScopeDraft(content.scope); setTermsDraft(content.special_terms); setDeliveryDraft(content.delivery_plan ?? emptyDeliveryPlan()); setConsent(false); setEditing(true) }}><PenLine className="mr-2 h-4 w-4" />Redigera utkast</Button>}
            <Button size="sm" variant="outline" onClick={download}><Download className="mr-2 h-4 w-4" />Ladda ner avtal (.txt)</Button>
          </div>
        </>}
      </div>}
    </section>
  )
}

export default AgreementPanel
