import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, CreditCard, Gauge, Loader2, Lock, Mail, Paperclip, Phone, Sparkles, Unlock, User, X } from 'lucide-react'
import { toast } from 'sonner'
import LeadRefundDialog from '@/components/supplier/LeadRefundDialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BUDGET_LABELS, CATEGORY_STYLES, MAX_OFFERS_PER_PROJECT, START_TIME_LABELS } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'
import { PAYMENT_PLAN_LABELS } from '@/lib/agreements'
import { clearOfferDraft, emptyOfferForm, readOfferDraft, saveOfferDraft } from '@/lib/offerDrafts'
import { numWord } from '@/lib/numberWords'
import {
  OFFER_ATTACHMENT_ACCEPT,
  OFFER_ATTACHMENT_BUCKET,
  getUnlockedProjectContact,
  submitProjectOffer,
  unlockProject,
  uploadOfferAttachment,
  validateOfferAttachment,
} from '@/lib/marketplaceActions'
import { trackFirstOfferReceived, trackLeadUnlocked, trackLeadUnlockStarted, trackLeadViewed, trackOfferSubmitted } from '@/lib/analytics'

const scoreProject = (project: any) => {
  let score = 0
  const reasons: string[] = []
  const descriptionLength = project?.description?.length || 0

  if (descriptionLength >= 500) {
    score += 30
    reasons.push('Detaljerad brief')
  } else if (descriptionLength >= 220) {
    score += 20
    reasons.push('Tydlig brief')
  } else if (descriptionLength >= 80) {
    score += 10
  }

  if (project?.budget_range && project.budget_range !== 'unknown') {
    score += 25
    reasons.push('Angiven budget')
  }
  if (project?.start_time === 'asap' || project?.start_time === 'within_month') {
    score += 20
    reasons.push('Nära startdatum')
  } else if (project?.start_time) {
    score += 10
  }
  if (project?.is_company) {
    score += 15
    reasons.push('Företagskund')
  }
  if ((project?.offer_count || 0) < MAX_OFFERS_PER_PROJECT) {
    score += 10
    reasons.push('Låg konkurrens')
  }

  const normalized = Math.min(100, score)
  const label = normalized >= 75 ? 'Utförligt underlag' : normalized >= 45 ? 'Visst underlag' : 'Behöver förtydligas'
  const tone = normalized >= 75
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : normalized >= 45
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-700 bg-slate-50 border-slate-200'

  return { score: normalized, label, tone, reasons }
}

const getOfferTemplate = (project: any) => ({
  title: `Offert: ${project?.title || 'digitalt projekt'}`,
  description: `Hej!\n\nTack för en tydlig projektbeskrivning. Vi kan hjälpa er med ${project?.category?.toLowerCase?.() || 'det digitala projektet'} och föreslår att vi börjar med ett kort uppstartsmöte där vi går igenom mål, omfattning, tidsplan och tekniska krav.\n\nFörslag på upplägg:\n1. Uppstart och kravgenomgång\n2. Design/struktur och prioritering av funktioner\n3. Produktion och löpande avstämningar\n4. Test, lansering och överlämning\n\nI offerten ingår tydlig projektledning, löpande kommunikation och rekommendationer för nästa steg.\n\nVänliga hälsningar`,
})

type Contact = {
  full_name?: string | null
  company_name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
}

const ProjectUnlock = () => {
  const { id } = useParams()
  const { user, supplierProfile, refreshProfile, hasActiveSubscription, trialExpired } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [contactError, setContactError] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reload, setReload] = useState(0)
  const [existingOffer, setExistingOffer] = useState(false)
  const submittingRef = useRef(false)
  const unlockingRef = useRef(false)
  const currentProjectId = useRef(id)
  currentProjectId.current = id
  const [contact, setContact] = useState<Contact | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [draftInfo, setDraftInfo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState(emptyOfferForm)

  const loadContact = useCallback(async (projectId: string) => {
    setContactError(false)
    try {
      const data = await getUnlockedProjectContact(projectId)
      if (currentProjectId.current !== projectId) return
      setContact(data)
      setContactError(!data)
    } catch {
      if (currentProjectId.current === projectId) { setContact(null); setContactError(true) }
    }
  }, [])

  useEffect(() => {
    if (!id || !user) return
    let cancelled = false
    const fetchData = async () => {
      setPageLoading(true)
      setLoadError(false)
      setProject(null)
      setContact(null)
      setIsUnlocked(false)
      setExistingOffer(false)
      setForm(emptyOfferForm())
      setFile(null)
      setPreviewOpen(false)
      setDraftInfo('')
      try {
        const [projectResult, unlockResult, offerResult] = await Promise.all([
          supabase.from('projects').select('*').eq('id', id).single(),
          supabase.from('unlocked_leads').select('id').eq('supplier_id', user.id).eq('project_id', id).maybeSingle(),
          supabase.from('offers').select('id').eq('supplier_id', user.id).eq('project_id', id).maybeSingle(),
        ])
        if (projectResult.error) throw projectResult.error
        if (unlockResult.error) throw unlockResult.error
        if (offerResult.error) throw offerResult.error
        if (cancelled) return
        setProject(projectResult.data)
        setIsUnlocked(Boolean(unlockResult.data))
        setExistingOffer(Boolean(offerResult.data))
        if (offerResult.data) clearOfferDraft(user.id, id)
        else if (unlockResult.data) {
          const draft = readOfferDraft(user.id, id)
          if (draft) { setForm(draft); setDraftInfo('Ditt sparade utkast har återställts. Välj eventuell bilaga igen.') }
        }
        try { trackLeadViewed(id, { category: projectResult.data.category, city: projectResult.data.city || undefined }) } catch { /* Best effort */ }
        if (unlockResult.data) await loadContact(id)
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }
    void fetchData()
    return () => { cancelled = true }
  }, [id, user, reload, loadContact])

  const translateUnlockError = (error: any): string => {
    const raw = typeof error?.message === 'string' ? error.message : ''
    if (/inga lead-krediter/i.test(raw)) return 'Du har inga lead-krediter kvar.'
    if (/provperiod/i.test(raw)) return 'Din provperiod har gått ut.'
    if (/tar inte emot fler offerter/i.test(raw) || /uppdraget finns inte/i.test(raw)) {
      return 'Uppdraget tar inte emot fler offerter just nu.'
    }
    if (/byråprofilen/i.test(raw)) return 'Byråprofilen kunde inte hittas.'
    if (/inloggad/i.test(raw)) return 'Du måste vara inloggad.'
    return raw || 'Kunde inte låsa upp uppdraget.'
  }

  const translateOfferError = (error: any): string => {
    const raw = typeof error?.message === 'string' ? error.message : ''
    if (error?.code === '23505' || /redan skickat/i.test(raw)) {
      return 'Du har redan skickat en offert på detta uppdrag.'
    }
    if (/tar inte emot fler offerter/i.test(raw) || /max(_| )offerter/i.test(raw) || /stängt/i.test(raw)) {
      return 'Uppdraget är fullt eller stängt och tar inte emot fler offerter.'
    }
    if (/lås.*upp/i.test(raw) || /låst/i.test(raw)) {
      return 'Du måste låsa upp uppdraget innan du kan skicka en offert.'
    }
    return raw || 'Kunde inte skicka offerten.'
  }

  const handleUnlock = async () => {
    if (!user || !id || !project || unlockingRef.current || project.status !== 'active') return
    unlockingRef.current = true

    setUnlocking(true)
    try {
      const result = await unlockProject(id)
      setIsUnlocked(true)
      setConfirmOpen(false)
      await loadContact(id)
      try { await refreshProfile() } catch { /* The unlock is already saved. */ }
      if (result?.already_unlocked) {
        toast.info('Uppdraget var redan upplåst – inga krediter drogs.')
      } else {
        try { trackLeadUnlocked(
          typeof project?.category === 'string' ? project.category : undefined,
          typeof project?.city === 'string' ? project.city : undefined,
        ) } catch { /* Analytics must not block the saved unlock. */ }
        toast.success('Uppdraget är upplåst.')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(translateUnlockError(error))
    } finally {
      unlockingRef.current = false
      setUnlocking(false)
    }
  }

  const applyOfferTemplate = () => {
    if (!project) return
    const template = getOfferTemplate(project)
    setForm(previous => ({
      ...previous,
      title: previous.title || template.title,
      description: previous.description || template.description,
    }))
    toast.success('Offertmall ifylld')
  }

  const handleSubmit = async () => {
    if (!user || !id || !project || submittingRef.current || existingOffer || !isUnlocked || project.status !== 'active') return
    const wasFirstOffer = (project.offer_count || 0) === 0

    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) {
      toast.error('Ange ett giltigt pris.')
      return
    }

    const deliveryWeeks = form.delivery_weeks ? Number(form.delivery_weeks) : null
    if (form.title.trim().length < 3 || form.description.trim().length < 20) {
      toast.error('Ange minst 3 tecken i titeln och 20 tecken i beskrivningen.')
      return
    }
    if (deliveryWeeks !== null && (!Number.isInteger(deliveryWeeks) || deliveryWeeks < 1 || deliveryWeeks > 520)) {
      toast.error('Ange leveranstid i hela veckor, mellan 1 och 520.')
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    let attachmentPath: string | null = null
    let offerSaved = false
    try {
      if (file) {
        const validation = validateOfferAttachment(file)
        if (validation.ok !== true) {
          toast.error(validation.error)
          return
        }
        attachmentPath = await uploadOfferAttachment(user.id, id, file)
      }

      await submitProjectOffer({
        projectId: id,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        deliveryWeeks,
        paymentPlan: form.payment_plan,
        attachmentUrl: attachmentPath,
      })

      offerSaved = true
      clearOfferDraft(user.id, id)
      setPreviewOpen(false)
      setExistingOffer(true)
      const category = typeof project?.category === 'string' ? project.category : undefined
      const city = typeof project?.city === 'string' ? project.city : undefined
      try {
        trackOfferSubmitted(category, city)
        if (wasFirstOffer) trackFirstOfferReceived(category, city)
      } catch { /* Analytics must not block the saved offer. */ }
      toast.success('Offert skickad! 🎉')
      navigate('/dashboard/supplier/offerter')
    } catch (error: any) {
      console.error(error)
      // Storage refuses deletion if the server saved an offer despite a lost response.
      if (attachmentPath && !offerSaved) {
        try { await supabase.storage.from(OFFER_ATTACHMENT_BUCKET).remove([attachmentPath]) } catch { /* Retry remains possible. */ }
      }
      toast.error(translateOfferError(error))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (pageLoading) return <div className="animate-pulse h-40 bg-muted rounded-xl" />
  if (!project || loadError) return <div role="alert" className="rounded-xl border p-6 text-sm"><p>Uppdraget kunde inte läsas. Det kan ha stängts eller tagits bort.</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setReload(n => n + 1)}>Försök igen</Button><Button asChild><Link to="/dashboard/supplier/uppdrag">Se tillgängliga uppdrag</Link></Button></div></div>

  const leadScore = scoreProject(project)
  const creditsLeft = supplierProfile?.lead_credits || 0
  const canUnlock = hasActiveSubscription || (creditsLeft > 0 && !trialExpired)
  const maxOffers = project.max_offers || MAX_OFFERS_PER_PROJECT
  const isClosed = (project.offer_count || 0) >= maxOffers || project.status !== 'active'

  return (
    <div className="max-w-3xl">
      <div className="bg-card rounded-xl border p-5 mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[project.category] || ''}`}>{project.category}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${leadScore.tone}`}>
            <Gauge className="h-3.5 w-3.5" /> {leadScore.label} · {leadScore.score}/100
          </span>
        </div>
        <h1 className="font-display text-xl font-bold">{project.title}</h1>
        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{project.description}</p>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
          <span>{BUDGET_LABELS[project.budget_range] || 'Budget diskuteras'}</span>
          <span>{START_TIME_LABELS[project.start_time] || 'Flexibel start'}</span>
          <span>{project.city || 'Sverige'}</span>
          <span>{timeAgo(project.created_at)}</span>
          <span>{project.offer_count || 0} av {maxOffers} offerter</span>
        </div>
        {leadScore.reasons.length > 0 && (
          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Underlag i briefen:</strong> {leadScore.reasons.join(' · ')}<p className="mt-1">Bedöms utifrån angivna uppgifter. Det är ingen kontroll av kundens köpavsikt.</p>
          </div>
        )}
      </div>

      {isUnlocked ? (
        <>
          <div className="bg-card rounded-xl border border-accent/30 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Unlock className="h-4 w-4 text-accent" />
              <h2 className="font-display text-lg font-semibold">Beställarens kontaktuppgifter</h2>
            </div>
            {contact ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {contact.full_name && <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{contact.full_name}</div>}
                {contact.company_name && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{contact.company_name}</div>}
                {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-4 w-4" />{contact.email}</a>}
                {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-4 w-4" />{contact.phone}</a>}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground"><p>{contactError ? 'Uppdraget är upplåst, men kontaktuppgifterna kunde inte läsas.' : 'Kontaktuppgifter saknas.'}</p><Button variant="outline" size="sm" onClick={() => id && loadContact(id)} className="mt-2">Hämta kontaktuppgifterna igen</Button></div>
            )}
            {id && (
              <div className="mt-4 border-t pt-3">
                <LeadRefundDialog projectId={id} />
              </div>
            )}
          </div>

          {existingOffer ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5"><h2 className="font-display text-lg font-semibold">Din offert är redan skickad</h2><p className="mt-1 text-sm text-muted-foreground">Följ beställarens beslut och ert samarbetsavtal under Mina offerter.</p><Button asChild className="mt-3"><Link to="/dashboard/supplier/offerter">Öppna Mina offerter</Link></Button></div>
          ) : isClosed ? (
            <div className="bg-card rounded-xl border p-6 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h2 className="font-display text-lg font-semibold mb-2">Uppdraget tar inte emot fler offerter.</h2>
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-display text-lg font-semibold">Skicka offert</h2>
                <Button type="button" variant="outline" size="sm" onClick={applyOfferTemplate} className="gap-1.5"><Sparkles className="h-4 w-4" />Snabb offertmall</Button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Beskriv vad som ingår och ange priset. Granska offerten innan den skickas till beställaren.</p>
              {draftInfo && <p role="status" className="mb-4 rounded-lg bg-muted p-3 text-sm">{draftInfo}</p>}
              <form onSubmit={event => { event.preventDefault(); setPreviewOpen(true) }} className="space-y-4">
                <div><Label htmlFor="offer-title">Offert-titel *</Label><Input id="offer-title" minLength={3} maxLength={200} value={form.title} onChange={event => setForm(previous => ({ ...previous, title: event.target.value }))} className="rounded-xl mt-1" required /></div>
                <div><Label htmlFor="offer-description">Beskrivning *</Label><Textarea id="offer-description" minLength={20} maxLength={20000} value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} className="rounded-xl mt-1 min-h-[120px]" required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="offer-price">{form.payment_plan === 'hourly' ? 'Timpris (kr/timme) *' : 'Totalpris (kr) *'}</Label><Input id="offer-price" type="number" min="0.01" max="100000000" step="0.01" value={form.price} onChange={event => setForm(previous => ({ ...previous, price: event.target.value }))} className="rounded-xl mt-1" required /></div>
                  <div><Label htmlFor="offer-weeks">Leveranstid (veckor)</Label><Input id="offer-weeks" type="number" min="1" max="520" step="1" value={form.delivery_weeks} onChange={event => setForm(previous => ({ ...previous, delivery_weeks: event.target.value }))} className="rounded-xl mt-1" /></div>
                </div>
                <div>
                  <Label htmlFor="offer-payment">Betalningsmodell</Label>
                  <Select value={form.payment_plan} onValueChange={value => setForm(previous => ({ ...previous, payment_plan: value }))}>
                    <SelectTrigger id="offer-payment" className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="fixed">Fast pris</SelectItem><SelectItem value="hourly">Timpris</SelectItem><SelectItem value="milestone">Milstolpar</SelectItem></SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">{form.payment_plan === 'hourly' ? 'Ange pris per timme exkl. moms. Beskriv uppskattad tidsåtgång och eventuell kostnadsram i offerten.' : form.payment_plan === 'milestone' ? 'Ange totalt pris exkl. moms. Beskriv milstolpar och delbetalningar i offerten.' : 'Ange totalt pris exkl. moms och beskriv tydligt vad som ingår.'}</p>
                </div>
                <div>
                  <Label htmlFor="offer-attachment">Bifoga fil (PDF, DOC, DOCX, JPG eller PNG, max 10 MB)</Label>
                  {file ? (
                    <div className="mt-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-sm"><Paperclip className="h-4 w-4" /><span className="truncate flex-1">{file.name}</span><button type="button" aria-label="Ta bort bilaga" onClick={() => setFile(null)}><X className="h-4 w-4" /></button></div>
                  ) : (
                    <label className="mt-1 flex items-center gap-2 cursor-pointer border border-dashed rounded-xl px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring">
                      <Paperclip className="h-4 w-4" /><span>Välj fil...</span>
                      <input id="offer-attachment" type="file" accept={OFFER_ATTACHMENT_ACCEPT} className="sr-only" onChange={event => {
                        const selected = event.target.files?.[0]
                        if (!selected) return
                        const validation = validateOfferAttachment(selected)
                        if (validation.ok !== true) {
                          toast.error(validation.error)
                          event.target.value = ''
                          return
                        }
                        setFile(selected)
                      }} />
                    </label>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={submitting} className="flex-1 rounded-xl">Granska offert →</Button>
                  <Button type="button" variant="outline" disabled={!form.title.trim() && !form.description.trim()} onClick={() => {
                    if (!user || !id) return
                    if (saveOfferDraft(user.id, id, form)) setDraftInfo('Utkast sparat i 14 dagar på den här enheten. Bilagor sparas inte.')
                    else toast.error('Utkastet kunde inte sparas på enheten. Behåll sidan öppen eller kopiera texten.')
                  }}>Spara utkast</Button>
                </div>
                <p className="text-xs text-muted-foreground">Ett utkast skickas inte till kunden. Det sparas bara på den här enheten.</p>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card rounded-xl border p-6 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold mb-2">Lås upp kontaktuppgifter</h2>
          <p className="text-sm text-muted-foreground mb-4">Se beställarens kontaktuppgifter och skicka offert.</p>
          {isClosed ? <div className="space-y-3"><p className="text-sm">Uppdraget tar inte emot fler offerter. Du behöver inte använda någon kredit här.</p><Button asChild variant="outline"><Link to="/dashboard/supplier/uppdrag">Hitta ett annat uppdrag</Link></Button></div> : canUnlock ? (
            <Button onClick={() => {
              setConfirmOpen(true)
              trackLeadUnlockStarted({
                category: typeof project?.category === 'string' ? project.category : undefined,
                city: typeof project?.city === 'string' ? project.city : undefined,
              })
            }} className="bg-primary hover:bg-primary/90">🔓 Lås upp ({hasActiveSubscription ? 'obegränsat' : `${numWord(creditsLeft)} krediter kvar`})</Button>
          ) : (
            <div className="space-y-3">
              <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{trialExpired ? 'Provperioden är slut. Välj en plan för att låsa upp en ny kontakt.' : 'Du har inga krediter kvar.'}</p>
              <Link to="/dashboard/supplier/fakturering"><Button className="gap-2"><CreditCard className="h-4 w-4" />Köp lead eller månadskort</Button></Link>
            </div>
          )}
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={open => { if (!submitting) setPreviewOpen(open) }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Granska din offert</DialogTitle><DialogDescription>Kontrollera innehållet som beställaren får. Inget skickas förrän du väljer Skicka offert.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Till uppdraget: {project.title}</p>
            <h3 className="font-display text-lg font-semibold break-words">{form.title}</h3>
            <div className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">{form.payment_plan === 'hourly' ? 'Timpris' : 'Totalpris'}</p><p className="mt-1 text-lg font-semibold">{formatPrice(Number(form.price))}{form.payment_plan === 'hourly' ? '/timme' : ''}</p><p className="text-xs text-muted-foreground">Exkl. moms · {PAYMENT_PLAN_LABELS[form.payment_plan]}</p></div><div><p className="text-xs text-muted-foreground">Leveranstid</p><p className="mt-1 font-semibold">{form.delivery_weeks ? `${form.delivery_weeks} veckor` : 'Enligt överenskommelse'}</p></div></div>
            <p className="whitespace-pre-wrap break-words text-sm">{form.description}</p>
            {file && <p className="flex items-center gap-2 text-sm"><Paperclip className="h-4 w-4 shrink-0" /><span className="break-all">Bilaga: {file.name}</span></p>}
          </div>
          <div className="flex flex-wrap gap-3 border-t pt-4"><Button variant="outline" disabled={submitting} onClick={() => setPreviewOpen(false)}>Fortsätt redigera</Button><Button disabled={submitting} onClick={handleSubmit}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{submitting ? 'Skickar…' : 'Skicka offert'}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lås upp kontaktuppgifter?</DialogTitle>
            <DialogDescription>{hasActiveSubscription ? 'Ditt månadskort täcker upplåsningen av' : 'Använd en lead-kredit för'} ”{project.title}”. Du har {hasActiveSubscription ? 'obegränsad tillgång' : `${numWord(creditsLeft)} krediter kvar`}.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4"><Button variant="outline" onClick={() => setConfirmOpen(false)}>Avbryt</Button><Button onClick={handleUnlock} disabled={unlocking}>{unlocking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Bekräfta</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectUnlock
