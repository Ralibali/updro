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

const ProjectWizard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialDescription = searchParams.get('beskrivning')?.trim().slice(0, 5000) || ''
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [form, setForm] = useState({
    category: '' as Category | '',
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
  const canContinue = Boolean(
    form.category && form.description.trim().length >= 20 && form.budget_range && form.start_time,
  )

  const applyAiBrief = (brief: BriefSuggestion) => {
    setForm(prev => ({ ...prev, ...brief }))
  }

  const improveDescription = async () => {
    if (!form.category || form.description.trim().length < 10 || aiLoading) return
    setAiLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('improve-description', {
        body: { title: form.title, category: form.category, description: form.description },
      })
      if (error) throw error
      if (data?.improved) {
        setForm(prev => ({ ...prev, description: data.improved }))
        toast.success('Beskrivningen har förbättrats! ✨')
      } else {
        toast.error(data?.error || 'Kunde inte förbättra beskrivningen.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Kunde inte förbättra beskrivningen just nu.')
    } finally {
      setAiLoading(false)
    }
  }

  const nextFromProject = () => {
    if (!canContinue) return
    trackLeadStarted('project_wizard')
    trackClick('lead_step_completed', 'Projektbeskrivning klar', { step: 1, category: form.category })
    setStep(2)
  }

  const publish = async () => {
    if (loading) return
    if (!canContinue) {
      toast.error('Fyll i kategori, beskrivning, budget och önskad start.')
      setStep(1)
      return
    }

    const description = form.description.trim()
    const title = form.title.trim().length >= 5
      ? form.title.trim()
      : inferTitle(description) || `${form.category} – nytt uppdrag`

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

      const { error } = await (supabase as any).from('guest_leads').insert({
        email,
        full_name: form.full_name.trim(),
        company_name: form.is_company ? form.company_name.trim() || null : null,
        phone: form.phone.trim() || null,
        title,
        description,
        category: form.category as string,
        budget_range: form.budget_range as string,
        start_time: form.start_time as string,
        is_company: form.is_company,
        source: 'publicera',
      })
      if (error) throw error

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {step <= totalSteps && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>Steg {step} av {totalSteps}</span>
                <span>Gratis · ingen bindning</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="mb-8 h-2" />
            </>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Vad behöver du hjälp med?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Tar cirka två minuter. Ingen registrering krävs.</p>
              </div>

              <AiBriefAssistant onAccept={applyAiBrief} initialText={form.description} />

              <div>
                <Label>Kategori *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={form.category === category}
                      onClick={() => setForm(prev => ({ ...prev, category }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium ${form.category === category ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}
                    >
                      <span className="text-2xl" aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                      <span className="text-xs text-center">{category}</span>
                      {form.category === category && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="project-title">Rubrik (valfritt)</Label>
                <Input
                  id="project-title"
                  value={form.title}
                  onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                  placeholder="Skapas automatiskt om du lämnar tomt"
                  maxLength={100}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="project-description">Beskriv projektet *</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={improveDescription} disabled={aiLoading || !form.category || form.description.trim().length < 10} className="text-xs gap-1">
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    {aiLoading ? 'Förbättrar...' : 'Förbättra med AI'}
                  </Button>
                </div>
                <Textarea
                  id="project-description"
                  value={form.description}
                  onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                  placeholder="Vad vill ni uppnå, vad behövs och vad finns redan?"
                  maxLength={5000}
                  className="rounded-xl mt-1 min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">Minst 20 tecken · {form.description.length}/5000</p>
              </div>

              <ChoiceGrid
                label="Budget *"
                options={BUDGET_OPTIONS}
                value={form.budget_range}
                onSelect={value => setForm(prev => ({ ...prev, budget_range: value as BudgetRange }))}
              />
              <ChoiceGrid
                label="Önskad start *"
                options={START_TIME_OPTIONS}
                value={form.start_time}
                onSelect={value => setForm(prev => ({ ...prev, start_time: value as StartTime }))}
                twoColumns
              />

              <Button type="button" onClick={nextFromProject} disabled={!canContinue} className="w-full rounded-xl py-5">
                Nästa <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Vem gäller uppdraget?</h2>
                <p className="mt-2 text-sm text-muted-foreground">Det hjälper byråerna att anpassa sina offerter.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TypeButton active={form.is_company} onClick={() => setForm(prev => ({ ...prev, is_company: true }))} icon={<Building2 className="h-6 w-6" />} label="Företag" />
                <TypeButton active={!form.is_company} onClick={() => setForm(prev => ({ ...prev, is_company: false }))} icon={<User className="h-6 w-6" />} label="Privatperson" />
              </div>
              {form.is_company && (
                <div>
                  <Label htmlFor="company-name">Företagsnamn (valfritt)</Label>
                  <Input id="company-name" autoComplete="organization" maxLength={160} value={form.company_name} onChange={event => setForm(prev => ({ ...prev, company_name: event.target.value }))} className="rounded-xl mt-1" />
                </div>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Tillbaka</Button>
                <Button type="button" disabled={loading} onClick={() => isAuthenticated ? publish() : setStep(3)} className="flex-1">
                  {isAuthenticated ? (loading ? 'Publicerar...' : 'Publicera gratis') : 'Nästa'} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && !isAuthenticated && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold">Vart ska vi skicka offerterna?</h2>
                <p className="mt-2 text-sm text-muted-foreground">Inget lösenord eller konto krävs.</p>
              </div>
              <Field label="Namn *" id="full-name" value={form.full_name} onChange={value => setForm(prev => ({ ...prev, full_name: value }))} autoComplete="name" />
              <Field label="E-post *" id="email" type="email" value={form.email} onChange={value => setForm(prev => ({ ...prev, email: value }))} autoComplete="email" />
              <Field label="Telefon (valfritt)" id="phone" type="tel" value={form.phone} onChange={value => setForm(prev => ({ ...prev, phone: value }))} autoComplete="tel" />
              <p className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
                Genom att skicka uppdraget godkänner du att Updro kontaktar dig om förfrågan och delar uppdragsuppgifterna med relevanta byråer. Läs vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link>.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />Tillbaka</Button>
                <Button type="button" onClick={publish} disabled={loading || form.full_name.trim().length < 2 || !validEmail(form.email)} className="flex-1 bg-accent hover:bg-brand-mint-hover text-accent-foreground">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Skickar...</> : <>Skicka uppdrag gratis<Sparkles className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center py-12" aria-live="polite">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
              <h2 className="font-display text-2xl font-bold">Ditt uppdrag är mottaget!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Vi börjar nu matcha uppdraget med relevanta byråer. Bekräftelse skickas till <strong className="text-foreground">{form.email.trim().toLowerCase()}</strong>.</p>
              <div className="rounded-xl bg-muted/40 p-4 max-w-md mx-auto text-left">
                <p className="text-sm font-semibold mb-2">Vill du följa offerterna live?</p>
                <p className="text-xs text-muted-foreground mb-3">Skapa ett gratis konto med samma e-postadress.</p>
                <Link to="/registrera"><Button className="w-full">Skapa gratis konto</Button></Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

const ChoiceGrid = ({ label, options, value, onSelect, twoColumns = false }: { label: string; options: readonly { value: string; label: string; icon: string }[]; value: string; onSelect: (value: string) => void; twoColumns?: boolean }) => (
  <div>
    <Label>{label}</Label>
    <div className={`grid gap-2 mt-2 ${twoColumns ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map(option => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onSelect(option.value)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${value === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
          <span aria-hidden="true">{option.icon}</span>{option.label}
        </button>
      ))}
    </div>
  </div>
)

const TypeButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button type="button" aria-pressed={active} onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
    {icon}<span className="text-sm font-medium">{label}</span>
  </button>
)

const Field = ({ label, id, type = 'text', value, onChange, autoComplete }: { label: string; id: string; type?: string; value: string; onChange: (value: string) => void; autoComplete?: string }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} maxLength={type === 'email' ? 254 : 120} className="rounded-xl mt-1" />
  </div>
)

export default ProjectWizard
