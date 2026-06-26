import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, CreditCard, Gauge, Loader2, Lock, Mail, Paperclip, Phone, Sparkles, Unlock, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BUDGET_LABELS, CATEGORY_STYLES, START_TIME_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { numWord } from '@/lib/numberWords'
import {
  OFFER_ATTACHMENT_ACCEPT,
  submitProjectOffer,
  unlockProject,
  uploadOfferAttachment,
  validateOfferAttachment,
} from '@/lib/marketplaceActions'

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
  if ((project?.offer_count || 0) < 3) {
    score += 10
    reasons.push('Låg konkurrens')
  }

  const normalized = Math.min(100, score)
  const label = normalized >= 75 ? 'Hög kvalitet' : normalized >= 45 ? 'Medel kvalitet' : 'Låg kvalitet'
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
  const { user, supplierProfile, refreshProfile, hasActiveSubscription } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [contact, setContact] = useState<Contact | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    delivery_weeks: '',
    payment_plan: 'fixed',
  })

  const loadContact = async (projectData: any) => {
    if (projectData?.guest_lead_id) {
      const { data, error } = await (supabase as any)
        .from('guest_leads')
        .select('full_name, company_name, email, phone')
        .eq('id', projectData.guest_lead_id)
        .maybeSingle()
      if (error) throw error
      setContact(data || null)
      return
    }

    if (projectData?.buyer_id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, company_name, email, phone, city')
        .eq('id', projectData.buyer_id)
        .maybeSingle()
      if (error) throw error
      setContact(data || null)
    }
  }

  useEffect(() => {
    if (!id || !user) return

    const fetchData = async () => {
      setPageLoading(true)
      try {
        const [{ data: projectData, error: projectError }, { data: unlockedLead, error: unlockError }] = await Promise.all([
          supabase.from('projects').select('*').eq('id', id).single(),
          supabase.from('unlocked_leads').select('id').eq('supplier_id', user.id).eq('project_id', id).maybeSingle(),
        ])

        if (projectError) throw projectError
        if (unlockError) throw unlockError

        const nextProject = projectData as any
        setProject(nextProject)
        const unlocked = Boolean(unlockedLead)
        setIsUnlocked(unlocked)
        if (unlocked) await loadContact(nextProject)
      } catch (error) {
        console.error(error)
        toast.error('Kunde inte läsa uppdraget.')
      } finally {
        setPageLoading(false)
      }
    }

    fetchData()
  }, [id, user])

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
    if (!user || !id || !project || unlocking) return

    setUnlocking(true)
    try {
      const result = await unlockProject(id)
      setIsUnlocked(true)
      await loadContact(project)
      await refreshProfile()
      setConfirmOpen(false)
      if (result?.already_unlocked) {
        toast.info('Uppdraget var redan upplåst – inga krediter drogs.')
      } else {
        toast.success('Kontaktuppgifter upplåsta! 🔓')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(translateUnlockError(error))
    } finally {
      setUnlocking(false)
    }
  }

  const applyOfferTemplate = () => {
    if (!project) return
    const template = getOfferTemplate(project)
    setForm(prev => ({
      ...prev,
      title: prev.title || template.title,
      description: prev.description || template.description,
    }))
    toast.success('Offertmall ifylld')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user || !id || !project || submitting) return

    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Ange ett giltigt pris.')
      return
    }

    setSubmitting(true)

    try {
      let attachmentPath: string | null = null
      if (file) {
        const validation = validateOfferAttachment(file)
        if (validation.ok !== true) {
          toast.error(validation.error)
          setSubmitting(false)
          return
        }
        attachmentPath = await uploadOfferAttachment(user.id, id, file)
      }

      await submitProjectOffer({
        projectId: id,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        deliveryWeeks: form.delivery_weeks ? Number.parseInt(form.delivery_weeks, 10) : null,
        paymentPlan: form.payment_plan,
        attachmentUrl: attachmentPath,
      })

      toast.success('Offert skickad! 🎉')
      navigate('/dashboard/supplier/offerter')
    } catch (error: any) {
      console.error(error)
      toast.error(translateOfferError(error))
    } finally {
      setSubmitting(false)
    }
  }


  if (pageLoading) return <div className="animate-pulse h-40 bg-muted rounded-xl" />
  if (!project) return <div className="rounded-xl border p-6 text-sm text-muted-foreground">Uppdraget kunde inte hittas.</div>

  const leadScore = scoreProject(project)
  const creditsLeft = supplierProfile?.lead_credits || 0
  const canUnlock = hasActiveSubscription || creditsLeft > 0
  const isClosed = (project.offer_count || 0) >= (project.max_offers || 5) || project.status !== 'active'

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
          <span>{project.offer_count || 0} av {project.max_offers || 5} offerter</span>
        </div>
        {leadScore.reasons.length > 0 && (
          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Varför detta kan vara ett bra lead:</strong> {leadScore.reasons.join(' · ')}
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
              <p className="text-sm text-muted-foreground">Kontaktuppgifterna kunde inte läsas. Kontakta Updro-supporten.</p>
            )}
          </div>

          {isClosed ? (
            <div className="bg-card rounded-xl border p-6 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h2 className="font-display text-lg font-semibold mb-2">Uppdraget tar inte emot fler offerter.</h2>
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-display text-lg font-semibold">Skicka offert</h2>
                <Button type="button" variant="outline" size="sm" onClick={applyOfferTemplate} className="gap-1.5"><Sparkles className="h-4 w-4" />Snabb offertmall</Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="offer-title">Offert-titel *</Label><Input id="offer-title" value={form.title} onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))} className="rounded-xl mt-1" required /></div>
                <div><Label htmlFor="offer-description">Beskrivning *</Label><Textarea id="offer-description" value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} className="rounded-xl mt-1 min-h-[120px]" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="offer-price">Pris (kr) *</Label><Input id="offer-price" type="number" min="1" value={form.price} onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))} className="rounded-xl mt-1" required /></div>
                  <div><Label htmlFor="offer-weeks">Leveranstid (veckor)</Label><Input id="offer-weeks" type="number" min="1" value={form.delivery_weeks} onChange={event => setForm(prev => ({ ...prev, delivery_weeks: event.target.value }))} className="rounded-xl mt-1" /></div>
                </div>
                <div>
                  <Label>Betalningsmodell</Label>
                  <Select value={form.payment_plan} onValueChange={value => setForm(prev => ({ ...prev, payment_plan: value }))}>
                    <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="fixed">Fast pris</SelectItem><SelectItem value="hourly">Timpris</SelectItem><SelectItem value="milestone">Milstolpar</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bifoga fil (PDF, DOC, DOCX, JPG eller PNG, max 10 MB)</Label>
                  {file ? (
                    <div className="mt-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-sm"><Paperclip className="h-4 w-4" /><span className="truncate flex-1">{file.name}</span><button type="button" onClick={() => setFile(null)}><X className="h-4 w-4" /></button></div>
                  ) : (
                    <label className="mt-1 flex items-center gap-2 cursor-pointer border border-dashed rounded-xl px-4 py-3 text-sm text-muted-foreground hover:border-primary/50">
                      <Paperclip className="h-4 w-4" /><span>Välj fil...</span>
                      <input type="file" accept={OFFER_ATTACHMENT_ACCEPT} className="hidden" onChange={event => {
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
                <Button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl py-5">
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Skickar...</> : 'Skicka offert →'}
                </Button>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card rounded-xl border p-6 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold mb-2">Lås upp kontaktuppgifter</h2>
          <p className="text-sm text-muted-foreground mb-4">Se beställarens kontaktuppgifter och skicka offert.</p>
          {canUnlock ? (
            <Button onClick={() => setConfirmOpen(true)} className="bg-primary hover:bg-primary/90">🔓 Lås upp ({hasActiveSubscription ? 'obegränsat' : `${numWord(creditsLeft)} krediter kvar`})</Button>
          ) : (
            <div className="space-y-3">
              <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">Du har inga krediter kvar.</p>
              <Link to="/dashboard/supplier/fakturering"><Button className="gap-2"><CreditCard className="h-4 w-4" />Köp lead eller månadskort</Button></Link>
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lås upp kontaktuppgifter?</DialogTitle>
            <DialogDescription>Använd en lead-kredit för ”{project.title}”. Du har {hasActiveSubscription ? 'obegränsad tillgång' : `${numWord(creditsLeft)} krediter kvar`}.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4"><Button variant="outline" onClick={() => setConfirmOpen(false)}>Avbryt</Button><Button onClick={handleUnlock} disabled={unlocking}>{unlocking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Bekräfta</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectUnlock
