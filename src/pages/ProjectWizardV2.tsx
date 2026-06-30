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
  const requestedCategory = searchParams.get('kategori')
  const initialCategory = requestedCategory && CATEGORIES.includes(requestedCategory as Category)
    ? requestedCategory as Category
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

  const totalSteps = isAuthenticated ? 2 : 3
  const stepLabels = isAuthenticated
    ? ['Beskriv behovet', 'Projektets ramar']
    : ['Beskriv behovet', 'Projektets ramar', 'Kontaktuppgifter']
  const descriptionReady = form.description.trim().length >= 20
  const detailsReady = Boolean(form.category && form.budget_range && form.start_time)

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
    if (!descriptionReady) return
    trackLeadStarted('project_wizard')
    trackClick('lead_step_completed', 'Projektbeskrivning klar', { step: 1 })
    setStep(2)
  }

  const goFromDetails = () => {
    if (!detailsReady) {
      toast.error('Välj kategori, budget och önskad start.')
      return
    }
    if (isAuthenticated) publish()
    else setStep(3)
  }

  const publish = async () => {
    if (loading) return
    if (!descriptionReady || !detailsReady) {
      toast.error('Fyll i beskrivning, kategori, budget och önskad start.')
      setStep(descriptionReady ? 2 : 1)
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
      if (form.full_name.trim().length < 2) throw new Error('Ange ditt namn.')
      if (!validEmail(email)) throw new Error('Ange en giltig e-postadress.')

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
      setStep(4)
    } catch (error: any) {
      console.error('Lead submission error:', error)
      toast.error(error?.message || 'Kunde inte skicka in uppdraget. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {step <= totalSteps && (
            <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>
                  Steg {step} av {totalSteps} · <strong className="font-semibold text-foreground">{stepLabels[step - 1]}</strong>
                </span>
                <span className="hidden sm:inline">Kostnadsfritt · ingen bindning</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>
          )}

          {step === 1 && (
            <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Börja med behovet</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Vad vill du få hjälp med?</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Beskriv nuläget, målet och det viktigaste byrån behöver känna till. Du kan skriva fritt och behöver inte använda fackspråk.
                </p>
              </div>

              <div>
                <Label htmlFor="project-description">Beskriv uppdraget *</Label>
                <Textarea
                  id="project-description"
                  autoFocus
                  value={form.description}
                  onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))}
                  placeholder="Exempel: Vi behöver en ny webbplats som presenterar våra tjänster, fungerar bra i mobilen och gör det enkelt att boka ett möte..."
                  maxLength={5000}
                  className="mt-2 min-h-[210px] rounded-2xl text-base leading-relaxed"
                />
                <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>Minst 20 tecken</span>
                  <span>{form.description.length}/5000</span>
                </div>
              </div>

              <AiBriefAssistant onAccept={applyAiBrief} initialText={form.description} />

              <div>
                <Label htmlFor="project-title">Kort rubrik <span className="font-normal text-muted-foreground">(valfritt)</span></Label>
                <Input
                  id="project-title"
                  value={form.title}
                  onChange={event => setForm(previous => ({ ...previous, title: event.target.value }))}
                  placeholder="Skapas automatiskt om du lämnar fältet tomt"
                  maxLength={100}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <Button type="button" onClick={goToDetails} disabled={!descriptionReady} className="h-12 w-full rounded-xl text-base font-semibold">
                Fortsätt till projektets ramar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-7 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hjälp oss matcha rätt</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Några snabba detaljer</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Välj det alternativ som ligger närmast. Du kan alltid förklara mer i beskrivningen.
                </p>
              </div>

              <div>
                <Label>Kategori *</Label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={form.category === category}
                      onClick={() => setForm(previous => ({ ...previous, category }))}
                      className={`relative flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-all ${
                        form.category === category
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <span className="text-2xl" aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                      <span className="text-center text-xs leading-tight">{category}</span>
                      {form.category === category && <Check className="absolute right-2 top-2 h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {form.category && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={improveDescription}
                  disabled={aiLoading || form.description.trim().length < 10}
                  className="gap-1 rounded-xl"
                >
                  <Wand2 className="h-4 w-4" />
                  {aiLoading ? 'Förbättrar beskrivningen...' : 'Förbättra beskrivningen med AI'}
                </Button>
              )}

              <ChoiceGrid
                label="Ungefärlig budget *"
                options={BUDGET_OPTIONS}
                value={form.budget_range}
                onSelect={value => setForm(previous => ({ ...previous, budget_range: value as BudgetRange }))}
              />
              <ChoiceGrid
                label="När vill du komma igång? *"
                options={START_TIME_OPTIONS}
                value={form.start_time}
                onSelect={value => setForm(previous => ({ ...previous, start_time: value as StartTime }))}
                twoColumns
              />

              <div>
                <Label>Vem gäller uppdraget?</Label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <TypeButton active={form.is_company} onClick={() => setForm(previous => ({ ...previous, is_company: true }))} icon={<Building2 className="h-6 w-6" />} label="Företag" />
                  <TypeButton active={!form.is_company} onClick={() => setForm(previous => ({ ...previous, is_company: false }))} icon={<User className="h-6 w-6" />} label="Privatperson" />
                </div>
              </div>

              {form.is_company && (
                <div>
                  <Label htmlFor="company-name">Företagsnamn <span className="font-normal text-muted-foreground">(valfritt)</span></Label>
                  <Input
                    id="company-name"
                    autoComplete="organization"
                    maxLength={160}
                    value={form.company_name}
                    onChange={event => setForm(previous => ({ ...previous, company_name: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
                </Button>
                <Button type="button" disabled={loading || !detailsReady} onClick={goFromDetails} className="h-12 flex-1 rounded-xl font-semibold">
                  {isAuthenticated ? (loading ? 'Publicerar...' : 'Publicera kostnadsfritt') : 'Fortsätt till kontaktuppgifter'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </section>
          )}

          {step === 3 && !isAuthenticated && (
            <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sista steget</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Hur ska byråerna nå dig?</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Du behöver inte skapa konto eller lösenord. Uppgifterna används för den här förfrågan.
                </p>
              </div>

              <Field label="Namn *" id="full-name" value={form.full_name} onChange={value => setForm(previous => ({ ...previous, full_name: value }))} autoComplete="name" />
              <Field label="E-post *" id="email" type="email" value={form.email} onChange={value => setForm(previous => ({ ...previous, email: value }))} autoComplete="email" />
              <Field label="Telefon (valfritt)" id="phone" type="tel" value={form.phone} onChange={value => setForm(previous => ({ ...previous, phone: value }))} autoComplete="tel" />

              <div className="absolute -left-[9999px]" aria-hidden="true">
                <Label htmlFor="website">Webbplats</Label>
                <Input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
              </div>

              <p className="rounded-2xl border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
                När du skickar förfrågan får Updro kontakta dig om uppdraget och dela uppdrags- och kontaktuppgifterna med upp till fem relevanta byråer. Läs vår <Link to="/integritetspolicy" className="font-medium text-primary hover:underline">integritetspolicy</Link>.
              </p>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
                </Button>
                <Button
                  type="button"
                  onClick={publish}
                  disabled={loading || form.full_name.trim().length < 2 || !validEmail(form.email)}
                  className="h-12 flex-1 rounded-xl bg-accent font-semibold text-accent-foreground hover:bg-brand-mint-hover"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Skickar...</>
                  ) : (
                    <>Skicka förfrågan kostnadsfritt<Sparkles className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-6 rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-sm md:px-10" aria-live="polite">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold">Förfrågan är inskickad!</h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  {confirmationEmailSent ? (
                    <>En bekräftelse har skickats till <strong className="text-foreground">{form.email.trim().toLowerCase()}</strong>. Vi matchar nu uppdraget med relevanta byråer.</>
                  ) : (
                    <>Förfrågan är sparad och matchas nu med relevanta byråer. De kan kontakta dig via uppgifterna du angav.</>
                  )}
                </p>
              </div>
              <div className="mx-auto max-w-md rounded-2xl bg-muted/40 p-5 text-left">
                <p className="text-sm font-semibold">Vill du följa svaren på ett ställe?</p>
                <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">
                  Skapa ett kostnadsfritt konto med samma e-postadress, så kopplas uppdraget automatiskt till kontot.
                </p>
                <Link to="/registrera"><Button className="h-11 w-full rounded-xl">Skapa kostnadsfritt konto</Button></Link>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

const ChoiceGrid = ({
  label,
  options,
  value,
  onSelect,
  twoColumns = false,
}: {
  label: string
  options: readonly { value: string; label: string; icon: string }[]
  value: string
  onSelect: (value: string) => void
  twoColumns?: boolean
}) => (
  <div>
    <Label>{label}</Label>
    <div className={`mt-3 grid gap-2 ${twoColumns ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onSelect(option.value)}
          className={`flex min-h-12 items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all ${
            value === option.value
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          }`}
        >
          <span aria-hidden="true">{option.icon}</span>
          {option.label}
          {value === option.value && <Check className="ml-auto h-4 w-4" />}
        </button>
      ))}
    </div>
  </div>
)

const TypeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
      active ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/30'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
)

const Field = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  autoComplete,
}: {
  label: string
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      autoComplete={autoComplete}
      maxLength={type === 'email' ? 254 : 120}
      className="mt-2 h-12 rounded-xl"
    />
  </div>
)

export default ProjectWizardV2
