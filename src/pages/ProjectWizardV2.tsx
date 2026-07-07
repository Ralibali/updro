import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Loader2, Sparkles, User, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AiBriefAssistant from '@/components/project/AiBriefAssistant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { trackClick } from '@/hooks/usePageTracking'
import { supabase } from '@/integrations/supabase/client'
import { trackLeadStarted, trackLeadSubmitted } from '@/lib/analytics'
import { BUDGET_OPTIONS, CATEGORIES, CATEGORY_ICONS, START_TIME_OPTIONS } from '@/lib/constants'
import type { BriefSuggestion } from '@/lib/briefAnalysis'
import type { BudgetRange, Category, StartTime } from '@/types'

const inferTitle = (description: string) => {
  const text = description.trim().replace(/\s+/g, ' ')
  const firstSentence = text.split(/[.!?]/)[0]?.trim() || text
  return firstSentence.length > 80 ? `${firstSentence.slice(0, 77)}...` : firstSentence
}

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const SUBMISSION_KEY = 'updro:last_guest_lead_submission'

const ProjectWizardV2 = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialDescription = searchParams.get('beskrivning')?.trim().slice(0, 5000) || ''
  const initialCategoryParam = searchParams.get('kategori')?.trim() || ''
  const initialCategory = (CATEGORIES as readonly string[]).includes(initialCategoryParam)
    ? (initialCategoryParam as Category)
    : ''
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [website, setWebsite] = useState('')
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)
  const [form, setForm] = useState({
    category: initialCategory as Category | '',
    title: inferTitle(initialDescription),
    description: initialDescription,
    budget_range: '' as BudgetRange | '',
    start_time: '' as StartTime | '',
    is_company: true,
    company_name: '',
    full_name: '',
    email: '',
    phone: '',
  })

  // 2 steps total for everyone: (1) describe, (2) details + contact (contact hidden if logged in)
  const totalSteps = 2
  const descLen = form.description.trim().length
  const descriptionReady = descLen >= 20
  const detailsReady = Boolean(form.category && form.budget_range && form.start_time)
  const contactReady = isAuthenticated || (form.full_name.trim().length >= 2 && validEmail(form.email))
  const canSubmit = descriptionReady && detailsReady && contactReady

  const applyAiBrief = (brief: BriefSuggestion) => setForm(previous => ({ ...previous, ...brief }))

  const improveDescription = async () => {
    if (!form.category || form.description.trim().length < 10 || aiLoading) return
    setAiLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('improve-description', {
        body: { title: form.title, category: form.category, description: form.description },
      })
      if (error) throw error
      if (!data?.improved) throw new Error(data?.error || 'Kunde inte förbättra beskrivningen.')
      setForm(previous => ({ ...previous, description: data.improved }))
      toast.success('Beskrivningen har förbättrats! ✨')
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Kunde inte förbättra beskrivningen just nu.')
    } finally {
      setAiLoading(false)
    }
  }

  const goToDetails = () => {
    if (!descriptionReady) {
      toast.error(`Skriv minst ${20 - descLen} tecken till.`)
      return
    }
    trackLeadStarted('project_wizard')
    trackClick('lead_step_completed', 'Projektbeskrivning klar', { step: 1 })
    setStep(2)
  }

  // Human-readable reason button is disabled (shown always so users understand)
  const submitBlockReason = (() => {
    const missing: string[] = []
    if (!form.category) missing.push('kategori')
    if (!form.budget_range) missing.push('budget')
    if (!form.start_time) missing.push('önskad start')
    if (!isAuthenticated) {
      if (form.full_name.trim().length < 2) missing.push('namn')
      if (!validEmail(form.email)) missing.push('giltig e-post')
    }
    if (missing.length === 0) return ''
    return `Fyll i ${missing.join(', ')} för att skicka.`
  })()

  const publish = async () => {
    if (loading) return
    if (!canSubmit) {
      toast.error(submitBlockReason || 'Fyll i alla obligatoriska fält.')
      return
    }

    const description = form.description.trim()
    const title = form.title.trim().length >= 5 ? form.title.trim() : inferTitle(description) || `${form.category} – nytt uppdrag`
    setLoading(true)

    try {
      if (isAuthenticated && user?.id) {
        const { error } = await supabase.from('projects').insert({
          buyer_id: user.id,
          title,
          description,
          category: form.category as string,
          budget_range: form.budget_range as string,
          start_time: form.start_time as string,
          is_company: form.is_company,
          status: 'pending',
        })
        if (error) throw error
        trackLeadSubmitted({ source: 'publicera', category: form.category as string, userType: 'buyer' })
        trackClick('lead_submitted', 'Publicera uppdrag', { category: form.category, user_type: 'buyer' })
        toast.success('Uppdraget är inskickat! ✅')
        navigate('/dashboard/buyer')
        return
      }

      const email = form.email.trim().toLowerCase()
      const lastSubmission = Number(localStorage.getItem(SUBMISSION_KEY) || 0)
      if (Date.now() - lastSubmission < 45_000) throw new Error('Vänta en liten stund innan du skickar ett nytt uppdrag.')

      const { data, error } = await supabase.functions.invoke('submit-guest-lead', {
        body: {
          website,
          email,
          full_name: form.full_name.trim(),
          company_name: form.is_company ? form.company_name.trim() : '',
          phone: form.phone.trim(),
          title,
          description,
          category: form.category,
          budget_range: form.budget_range,
          start_time: form.start_time,
          is_company: form.is_company,
        },
      })
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Kunde inte skicka uppdraget.')

      localStorage.setItem(SUBMISSION_KEY, String(Date.now()))
      setConfirmationEmailSent(Boolean(data?.email_sent))
      trackLeadSubmitted({ source: 'publicera', category: form.category as string, userType: 'guest' })
      trackClick('lead_submitted', 'Skicka uppdrag gratis', { category: form.category, user_type: 'guest' })
      setStep(3)
    } catch (error: any) {
      console.error('Lead submission error:', error)
      toast.error(error?.message || 'Kunde inte skicka in uppdraget. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  const step1DisabledHint = descriptionReady
    ? ''
    : descLen === 0
      ? 'Skriv några meningar om vad du behöver hjälp med.'
      : `Skriv ${20 - descLen} tecken till för att fortsätta.`

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {step <= totalSteps && <><div className="flex justify-between text-xs text-muted-foreground mb-3"><span>Steg {step} av {totalSteps}</span><span>Gratis · ingen bindning</span></div><Progress value={(step / totalSteps) * 100} className="mb-8 h-2" /></>}

          {step === 1 && <div className="space-y-6">
            <div><h1 className="font-display text-2xl font-bold">Vad behöver du hjälp med?</h1><p className="mt-2 text-sm text-muted-foreground">Börja med att beskriva behovet med egna ord. Ingen registrering krävs.</p></div>
            <div><Label htmlFor="project-description">Beskriv uppdraget *</Label><Textarea id="project-description" autoFocus value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} placeholder="Exempel: Vi behöver en ny hemsida som presenterar våra tjänster och gör det lätt att boka möte..." maxLength={5000} className="rounded-xl mt-1 min-h-[180px]" aria-describedby="project-description-help" aria-invalid={form.description.length > 0 && form.description.trim().length < 20} />{(() => { const len = form.description.length; const min = 80; const strong = 220; const msg = len >= strong ? 'Bra! Detaljerade uppdrag får fler offerter.' : len >= min ? 'Toppen – nu har byråer bra underlag.' : `${len} / minst ${min} tecken för bra matchning`; const tone = len >= strong ? 'text-primary' : 'text-muted-foreground'; return <p id="project-description-help" className={`text-xs mt-1 ${tone}`}>{msg} · {len}/5000</p> })()}</div>
            <AiBriefAssistant onAccept={applyAiBrief} initialText={form.description} />
            <div><Label htmlFor="project-title">Rubrik (valfritt)</Label><Input id="project-title" value={form.title} onChange={event => setForm(previous => ({ ...previous, title: event.target.value }))} placeholder="Skapas automatiskt om du lämnar tomt" maxLength={100} className="rounded-xl mt-1" /></div>
            <div>
              <Button type="button" onClick={goToDetails} disabled={!descriptionReady} className="w-full rounded-xl py-5">Nästa <ArrowRight className="ml-2 h-4 w-4" /></Button>
              {step1DisabledHint && <p className="text-xs text-muted-foreground mt-2 text-center" aria-live="polite">{step1DisabledHint}</p>}
            </div>
          </div>}

          {step === 2 && <div className="space-y-6">
            <div><h2 className="font-display text-2xl font-bold">Sista detaljerna</h2><p className="mt-2 text-sm text-muted-foreground">{isAuthenticated ? 'Välj kategori, budget och start så publicerar vi uppdraget.' : 'Välj kategori, budget och start – och vart byråerna når dig.'}</p></div>

            <div><Label>Kategori *</Label><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">{CATEGORIES.map(category => <button key={category} type="button" aria-pressed={form.category === category} onClick={() => setForm(previous => ({ ...previous, category }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium ${form.category === category ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}><span className="text-2xl" aria-hidden="true">{CATEGORY_ICONS[category]}</span><span className="text-xs text-center">{category}</span>{form.category === category && <Check className="h-3 w-3" />}</button>)}</div></div>

            {form.category && <Button type="button" variant="outline" size="sm" onClick={improveDescription} disabled={aiLoading || form.description.trim().length < 10} className="gap-1"><Wand2 className="h-4 w-4" />{aiLoading ? 'Förbättrar...' : 'Förbättra beskrivningen med AI'}</Button>}

            <ChoiceGrid label="Budget *" options={BUDGET_OPTIONS} value={form.budget_range} onSelect={value => setForm(previous => ({ ...previous, budget_range: value as BudgetRange }))} />
            <ChoiceGrid label="Önskad start *" options={START_TIME_OPTIONS} value={form.start_time} onSelect={value => setForm(previous => ({ ...previous, start_time: value as StartTime }))} twoColumns />

            <div className="grid grid-cols-2 gap-3"><TypeButton active={form.is_company} onClick={() => setForm(previous => ({ ...previous, is_company: true }))} icon={<Building2 className="h-6 w-6" />} label="Företag" /><TypeButton active={!form.is_company} onClick={() => setForm(previous => ({ ...previous, is_company: false }))} icon={<User className="h-6 w-6" />} label="Privatperson" /></div>
            {form.is_company && <div><Label htmlFor="company-name">Företagsnamn (valfritt)</Label><Input id="company-name" autoComplete="organization" maxLength={160} value={form.company_name} onChange={event => setForm(previous => ({ ...previous, company_name: event.target.value }))} className="rounded-xl mt-1" /></div>}

            {!isAuthenticated && <>
              <div className="pt-2 border-t">
                <h3 className="font-display text-lg font-semibold mb-1">Hur når byråerna dig?</h3>
                <p className="text-xs text-muted-foreground mb-4">Inget lösenord eller konto krävs.</p>
                <div className="space-y-4">
                  <Field label="Namn *" id="full-name" value={form.full_name} onChange={value => setForm(previous => ({ ...previous, full_name: value }))} autoComplete="name" />
                  <Field label="E-post *" id="email" type="email" value={form.email} onChange={value => setForm(previous => ({ ...previous, email: value }))} autoComplete="email" />
                  <Field label="Telefon (valfritt)" id="phone" type="tel" value={form.phone} onChange={value => setForm(previous => ({ ...previous, phone: value }))} autoComplete="tel" />
                </div>
              </div>
              <div className="absolute -left-[9999px]" aria-hidden="true"><Label htmlFor="website">Webbplats</Label><Input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
              <p className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">Genom att skicka uppdraget godkänner du att Updro kontaktar dig om förfrågan och delar uppdragsuppgifterna med relevanta byråer. Läs vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link>.</p>
            </>}

            <div className="space-y-2">
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Tillbaka</Button>
                <Button type="button" onClick={publish} disabled={loading || !canSubmit} className="flex-1 bg-accent hover:bg-brand-mint-hover text-accent-foreground">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Skickar...</> : <>{isAuthenticated ? 'Publicera gratis' : 'Skicka uppdrag gratis'}<Sparkles className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
              {submitBlockReason && !loading && <p className="text-xs text-muted-foreground text-center" aria-live="polite">{submitBlockReason}</p>}
            </div>
          </div>}

          {step === 3 && <div className="space-y-6 text-center py-12" aria-live="polite"><div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div><h2 className="font-display text-2xl font-bold">Ditt uppdrag är mottaget!</h2><p className="text-muted-foreground max-w-md mx-auto">{confirmationEmailSent ? <>En bekräftelse har skickats till <strong className="text-foreground">{form.email.trim().toLowerCase()}</strong>. Vi matchar nu uppdraget med relevanta byråer.</> : <>Förfrågan är sparad och matchas nu med relevanta byråer. De kan kontakta dig via uppgifterna du angav.</>}</p><div className="rounded-xl bg-muted/40 p-4 max-w-md mx-auto text-left"><p className="text-sm font-semibold mb-2">Vill du följa offerterna live?</p><p className="text-xs text-muted-foreground mb-3">Skapa ett gratis konto med samma e-postadress så kopplas uppdraget till kontot.</p><Link to="/registrera"><Button className="w-full">Skapa gratis konto</Button></Link></div></div>}
        </div>
      </main>
      <Footer />
    </div>
  )
}

const ChoiceGrid = ({ label, options, value, onSelect, twoColumns = false }: { label: string; options: readonly { value: string; label: string; icon: string }[]; value: string; onSelect: (value: string) => void; twoColumns?: boolean }) => <div><Label>{label}</Label><div className={`grid gap-2 mt-2 ${twoColumns ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onSelect(option.value)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${value === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}><span aria-hidden="true">{option.icon}</span>{option.label}</button>)}</div></div>
const TypeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => <button type="button" aria-pressed={active} onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>{icon}<span className="text-sm font-medium">{label}</span></button>
const Field = ({ label, id, type = 'text', value, onChange, autoComplete }: { label: string; id: string; type?: string; value: string; onChange: (value: string) => void; autoComplete?: string }) => <div><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} maxLength={type === 'email' ? 254 : 120} className="rounded-xl mt-1" /></div>

export default ProjectWizardV2
