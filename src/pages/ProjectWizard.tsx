import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'
import { CATEGORIES, CATEGORY_ICONS, BUDGET_OPTIONS, START_TIME_OPTIONS, PROJECT_TEMPLATES } from '@/lib/constants'
import { ArrowLeft, ArrowRight, Check, Building2, User, Sparkles } from 'lucide-react'

const ProjectWizard = () => {
  const { user, isAuthenticated, profile, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    budget_range: '',
    start_time: '',
    is_company: true,
    company_name: '',
    // Auth fields (step 3)
    full_name: '',
    email: '',
    password: '',
  })

  const templates = form.category ? PROJECT_TEMPLATES[form.category] || [] : []

  const applyTemplate = (t: typeof templates[0]) => {
    setSelectedTemplate(t.id)
    setForm(prev => ({ ...prev, title: t.title, description: t.description, budget_range: t.budget_hint }))
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    setForm(prev => ({ ...prev, title: '', description: '', budget_range: '' }))
  }

  const canNext1 = form.category && form.title.length >= 5 && form.description.length >= 20 && form.budget_range && form.start_time

  const handlePublish = async () => {
    setLoading(true)
    let userId = user?.id

    // If not authenticated, create account first
    if (!isAuthenticated) {
      const { error } = await signUp({
        email: form.email,
        password: form.password,
        role: 'buyer',
        full_name: form.full_name,
        company_name: form.is_company ? form.company_name : undefined,
      })
      if (error) {
        toast.error(error.message || 'Kunde inte skapa konto')
        setLoading(false)
        return
      }
      // Get the new user
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id
    }

    if (!userId) {
      toast.error('Något gick fel. Försök igen.')
      setLoading(false)
      return
    }

    const { error: projectError } = await supabase.from('projects').insert({
      buyer_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      budget_range: form.budget_range,
      start_time: form.start_time,
      city: form.city,
      is_company: form.is_company,
      status: 'active',
    })

    setLoading(false)

    if (projectError) {
      toast.error('Kunde inte publicera uppdraget.')
    } else {
      toast.success('Uppdraget är publicerat! 🎉')
      navigate('/dashboard/buyer')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Progress value={(step / (isAuthenticated ? 2 : 3)) * 100} className="mb-8 h-2" />

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Berätta om ditt uppdrag</h2>

              {/* Category */}
              <div>
                <Label>Kategori *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setForm(prev => ({ ...prev, category: cat })); setSelectedTemplate(null) }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all ${form.category === cat ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}
                    >
                      <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-xs text-center">{cat}</span>
                      {form.category === cat && <Check className="h-3 w-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <Label>Välj en mall att utgå från (valfritt)</Label>
                  <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border w-36 text-xs font-medium transition-all ${selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <span className="text-center">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  {selectedTemplate && (
                    <button onClick={clearTemplate} className="text-xs text-muted-foreground hover:underline mt-1">
                      ✕ Rensa mall
                    </button>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <Label>Titel *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="rounded-xl mt-1"
                  maxLength={100}
                  placeholder="T.ex. Ny hemsida för restaurang"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{form.title.length}/100</p>
              </div>

              {/* Description */}
              <div>
                <Label>Beskrivning *</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="rounded-xl mt-1 min-h-[150px]"
                  placeholder="Beskriv vad du behöver hjälp med..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{form.description.length} tecken · Mer detaljer = bättre offerter</p>
              </div>

              {/* Budget */}
              <div>
                <Label>Budget *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, budget_range: opt.value }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${form.budget_range === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start time */}
              <div>
                <Label>Önskad start *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {START_TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, start_time: opt.value }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${form.start_time === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl py-5"
              >
                Nästa <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Lite om dig</h2>

              <div>
                <Label>Är du företag eller privatperson?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, is_company: true }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${form.is_company ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm font-medium">Företag</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, is_company: false }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${!form.is_company ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">Privatperson</span>
                  </button>
                </div>
              </div>

              {form.is_company && (
                <div>
                  <Label>Företagsnamn</Label>
                  <Input
                    value={form.company_name}
                    onChange={e => setForm(prev => ({ ...prev, company_name: e.target.value }))}
                    className="rounded-xl mt-1"
                  />
                </div>
              )}

              <div>
                <Label>Stad/region *</Label>
                <Input
                  value={form.city}
                  onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                  className="rounded-xl mt-1"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
                </Button>
                <Button
                  onClick={() => isAuthenticated ? handlePublish() : setStep(3)}
                  disabled={!canNext2 || loading}
                  className="flex-1 bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl py-5"
                >
                  {isAuthenticated ? (loading ? 'Publicerar...' : 'Publicera uppdrag gratis →') : 'Nästa →'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 - Account creation */}
          {step === 3 && !isAuthenticated && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Sista steget – skapa gratis konto</h2>

              <Button variant="outline" className="w-full py-5" onClick={() => signInWithGoogle()}>
                Fortsätt med Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">eller</span></div>
              </div>

              <div>
                <Label>Namn *</Label>
                <Input value={form.full_name} onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label>E-post *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label>Lösenord *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} className="rounded-xl mt-1" minLength={6} required />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={loading || !form.full_name || !form.email || !form.password}
                  className="flex-1 bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl py-5"
                >
                  {loading ? 'Skapar konto...' : (
                    <>
                      Publicera uppdrag gratis
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProjectWizard
