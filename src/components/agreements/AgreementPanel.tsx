import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileSignature, Loader2, PenLine, Send, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/dateUtils'
import {
  AGREEMENT_STATUS_LABELS,
  PAYMENT_PLAN_LABELS,
  STANDARD_CLAUSES,
  agreementStatus,
  applyEdits,
  buildDefaultAgreementContent,
  markBuyerConfirmed,
  markSupplierConfirmed,
  parseAgreementContent,
  type AgreementContent,
} from '@/lib/agreements'
import type { Json } from '@/integrations/supabase/types'

type Role = 'buyer' | 'supplier'

interface AgreementPanelProps {
  projectId: string
  offerId: string
  role: Role
}

interface AgreementRow {
  id: string
  content: AgreementContent
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Digitalt samarbetsavtal mellan beställare och byrå efter accepterad offert.
 * Köparen skapar och skickar, byrån bekräftar – därefter är avtalet låst.
 * Lagras i public.project_agreements; behörigheten styrs av befintliga
 * RLS-policyer (endast parterna, och bara när offerten är accepterad).
 */
const AgreementPanel = ({ projectId, offerId, role }: AgreementPanelProps) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agreement, setAgreement] = useState<AgreementRow | null>(null)
  const [context, setContext] = useState<{
    projectTitle: string
    buyerId: string
    buyerName: string
    supplierId: string
    supplierName: string
    offer: {
      title: string
      description: string
      price: number
      payment_plan: string | null
      delivery_weeks: number | null
    }
  } | null>(null)
  const [editing, setEditing] = useState(false)
  const [scopeDraft, setScopeDraft] = useState('')
  const [termsDraft, setTermsDraft] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: offer }, { data: agreementRow }] = await Promise.all([
      supabase
        .from('offers')
        .select('id, title, description, price, payment_plan, delivery_weeks, supplier_id, status, projects(id, title, buyer_id)')
        .eq('id', offerId)
        .maybeSingle(),
      supabase
        .from('project_agreements')
        .select('id, content')
        .eq('project_id', projectId)
        .eq('offer_id', offerId)
        .maybeSingle(),
    ])

    if (!offer || offer.status !== 'accepted' || !offer.projects) {
      setContext(null)
      setAgreement(null)
      setLoading(false)
      return
    }

    const project = Array.isArray(offer.projects) ? offer.projects[0] : offer.projects
    const [{ data: buyerProfile }, { data: supplierProfile }] = await Promise.all([
      supabase.from('profiles').select('full_name, company_name').eq('id', project.buyer_id).maybeSingle(),
      supabase.from('profiles').select('full_name, company_name').eq('id', offer.supplier_id).maybeSingle(),
    ])

    setContext({
      projectTitle: project.title,
      buyerId: project.buyer_id,
      buyerName: buyerProfile?.company_name || buyerProfile?.full_name || 'Beställaren',
      supplierId: offer.supplier_id,
      supplierName: supplierProfile?.company_name || supplierProfile?.full_name || 'Byrån',
      offer: {
        title: offer.title,
        description: offer.description,
        price: offer.price,
        payment_plan: offer.payment_plan,
        delivery_weeks: offer.delivery_weeks,
      },
    })

    const parsed = parseAgreementContent(agreementRow?.content)
    setAgreement(agreementRow && parsed ? { id: agreementRow.id, content: parsed } : null)
    setLoading(false)
  }, [projectId, offerId])

  useEffect(() => {
    load()
  }, [load])

  const content = agreement?.content ?? null
  const status = useMemo(() => (content ? agreementStatus(content) : null), [content])
  const isBuyer = role === 'buyer'

  const notify = async (userId: string, title: string, message: string, link: string) => {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'agreement_update',
      title,
      message,
      link,
    })
  }

  const createAgreement = async () => {
    if (!context || !user) return
    setSaving(true)
    const newContent = buildDefaultAgreementContent(
      { title: context.projectTitle },
      context.offer,
      context.buyerName,
      context.supplierName,
    )
    const { data, error } = await supabase
      .from('project_agreements')
      .insert({
        project_id: projectId,
        offer_id: offerId,
        created_by: user.id,
        content: newContent as unknown as Json,
      })
      .select('id, content')
      .maybeSingle()
    setSaving(false)
    if (error) {
      toast.error('Kunde inte skapa avtalet. Försök igen.')
      return
    }
    const parsed = parseAgreementContent(data?.content)
    if (data && parsed) setAgreement({ id: data.id, content: parsed })
    toast.success('Samarbetsavtal skapat – granska och skicka till byrån.')
  }

  const saveContent = async (next: AgreementContent, successMessage: string) => {
    if (!agreement) return
    setSaving(true)
    const { error } = await supabase
      .from('project_agreements')
      .update({ content: next as unknown as Json, updated_at: new Date().toISOString() })
      .eq('id', agreement.id)
    setSaving(false)
    if (error) {
      toast.error('Kunde inte spara avtalet. Försök igen.')
      return
    }
    setAgreement({ ...agreement, content: next })
    toast.success(successMessage)
  }

  const startEditing = () => {
    if (!content) return
    setScopeDraft(content.scope)
    setTermsDraft(content.special_terms)
    setEditing(true)
  }

  const saveEdits = async () => {
    if (!content || !context) return
    const next = applyEdits(content, { scope: scopeDraft.trim(), special_terms: termsDraft.trim() })
    if (next === content) {
      setEditing(false)
      return
    }
    await saveContent(next, 'Avtalet uppdaterat – båda parter behöver bekräfta igen.')
    setEditing(false)
    if (content.buyer_confirmed_at || content.supplier_confirmed_at) {
      await notify(
        context.supplierId,
        'Samarbetsavtalet har ändrats',
        `Beställaren har uppdaterat villkoren för "${context.projectTitle}". Granska och bekräfta på nytt.`,
        '/dashboard/supplier/offerter',
      )
    }
  }

  const sendToSupplier = async () => {
    if (!content || !context) return
    const next = markBuyerConfirmed(content)
    await saveContent(next, 'Avtalet skickat – byrån får en notis om att bekräfta.')
    await notify(
      context.supplierId,
      'Samarbetsavtal att bekräfta',
      `${context.buyerName} har skickat ett samarbetsavtal för "${context.projectTitle}". Granska och bekräfta villkoren.`,
      '/dashboard/supplier/offerter',
    )
  }

  const confirmAsSupplier = async () => {
    if (!content || !context) return
    const next = markSupplierConfirmed(content)
    if (next === content) return
    await saveContent(next, 'Bekräftat! Avtalet är nu undertecknat av båda parter.')
    await notify(
      context.buyerId,
      'Byrån har bekräftat avtalet',
      `${context.supplierName} har bekräftat samarbetsavtalet för "${context.projectTitle}".`,
      `/dashboard/buyer/uppdrag/${projectId}`,
    )
  }

  if (loading) {
    return (
      <div className="mt-4 rounded-xl border bg-muted/20 p-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Laddar samarbetsavtal…
      </div>
    )
  }

  if (!context) return null

  return (
    <section className="mt-4 rounded-xl border bg-card p-5" aria-label="Samarbetsavtal">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-display font-semibold">Samarbetsavtal</h3>
        </div>
        {status && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              status === 'signed'
                ? 'bg-emerald-500/10 text-emerald-700'
                : status === 'awaiting_supplier'
                  ? 'bg-amber-500/10 text-amber-700'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {status === 'signed' && <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
            {AGREEMENT_STATUS_LABELS[status]}
          </span>
        )}
      </header>

      {!content && isBuyer && (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            Dokumentera överenskommelsen med {context.supplierName} – omfattning, pris och villkor
            hämtas automatiskt från offerten. Båda parter bekräftar digitalt innan avtalet är låst.
          </p>
          <Button onClick={createAgreement} disabled={saving} className="mt-3 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            Skapa samarbetsavtal
          </Button>
        </div>
      )}

      {!content && !isBuyer && (
        <p className="mt-3 text-sm text-muted-foreground">
          Beställaren har inte skapat något samarbetsavtal ännu. Du får en notis när det är redo att bekräfta.
        </p>
      )}

      {content && (
        <div className="mt-4 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pris</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatPrice(content.price_sek)}</dd>
              {content.payment_plan && (
                <dd className="text-xs text-muted-foreground">{PAYMENT_PLAN_LABELS[content.payment_plan] || content.payment_plan}</dd>
              )}
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tidsplan</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {content.delivery_weeks ? `ca ${content.delivery_weeks} veckor` : 'Enligt dialog'}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parter</dt>
              <dd className="mt-1 font-semibold text-foreground">{content.buyer_name}</dd>
              <dd className="text-xs text-muted-foreground">och {content.supplier_name}</dd>
            </div>
          </dl>

          {editing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="agreement-scope">Omfattning</Label>
                <Textarea
                  id="agreement-scope"
                  value={scopeDraft}
                  onChange={event => setScopeDraft(event.target.value)}
                  maxLength={2000}
                  className="mt-1 min-h-[100px] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="agreement-terms">Särskilda villkor (valfritt)</Label>
                <Textarea
                  id="agreement-terms"
                  value={termsDraft}
                  onChange={event => setTermsDraft(event.target.value)}
                  placeholder="T.ex. avstämningsmöten varje vecka, åtkomst till system, underleverantörer…"
                  maxLength={2000}
                  className="mt-1 min-h-[80px] rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sparade ändringar gör att båda parter behöver bekräfta avtalet på nytt.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdits} disabled={saving || !scopeDraft.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Spara ändringar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Avbryt</Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Omfattning</p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{content.scope}</p>
              </div>
              {content.special_terms && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Särskilda villkor</p>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{content.special_terms}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Standardvillkor</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {STANDARD_CLAUSES.map(clause => <li key={clause}>{clause}</li>)}
                </ul>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  {content.buyer_confirmed_at
                    ? `✓ Skickat av ${content.buyer_name} ${formatDateTime(content.buyer_confirmed_at)}`
                    : 'Ej skickat till byrån ännu'}
                </p>
                <p>
                  {content.supplier_confirmed_at
                    ? `✓ Bekräftat av ${content.supplier_name} ${formatDateTime(content.supplier_confirmed_at)}`
                    : 'Ej bekräftat av byrån ännu'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isBuyer && status !== 'signed' && (
                  <>
                    <Button size="sm" onClick={sendToSupplier} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {status === 'awaiting_supplier' ? 'Skicka igen' : 'Skicka till byrån för bekräftelse'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={startEditing} className="gap-2">
                      <PenLine className="h-4 w-4" /> Redigera
                    </Button>
                  </>
                )}
                {!isBuyer && status === 'awaiting_supplier' && (
                  <Button size="sm" onClick={confirmAsSupplier} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Bekräfta samarbetsavtalet
                  </Button>
                )}
                {status === 'signed' && (
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Avtalet är låst. Kontakta varandra direkt vid eventuella ändringar.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default AgreementPanel
