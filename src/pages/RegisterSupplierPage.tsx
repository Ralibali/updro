import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CreditCard, Gift, MessageCircle, Shield, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { trackSignUp } from '@/lib/analytics'
import { CATEGORIES, CATEGORY_ICONS, TRIAL_DAYS, TRIAL_LEADS } from '@/lib/constants'
import { setSEOMeta } from '@/lib/seoHelpers'

const RegisterSupplierPage = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
    org_number: '',
    categories: [] as string[],
    accepted: false,
    newsletter: false,
  })

  useEffect(() => {
    setSEOMeta({
      title: 'Registrera din byrå – Få fler kunder gratis | Updro',
      description: 'Registrera din byrå på Updro och få fem gratis leads. Kvalificerade uppdrag, ingen bindningstid.',
      canonical: 'https://updro.se/registrera/byra',
      noindex: true,
    })
  }, [])

  const toggleCategory = (category: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(item => item !== category)
        : [...prev.categories, category],
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    if (!form.accepted) {
      toast.error('Du måste godkänna villkoren.')
      return
    }
    if (form.categories.length === 0) {
      toast.error('Välj minst en kategori.')
      return
    }

    const email = form.email.trim().toLowerCase()
    setLoading(true)
    const { error } = await signUp({
      email,
      password: form.password,
      role: 'supplier',
      full_name: form.full_name.trim(),
      company_name: form.company_name.trim(),
      phone: form.phone.trim() || undefined,
      categories: form.categories,
      org_number: form.org_number.trim() || undefined,
    })

    if (error) {
      setLoading(false)
      toast.error(error.message || 'Något gick fel vid registrering.')
      return
    }

    if (form.newsletter) {
      const { error: newsletterError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'supplier_registration' })

      if (newsletterError && newsletterError.code !== '23505') {
        console.warn('Newsletter opt-in could not be saved', newsletterError)
      }
    }

    trackSignUp('supplier')
    setLoading(false)
    toast.success('Konto skapat! Kolla din inkorg (och skräpposten) för att bekräfta din e-post.', {
      duration: 8000,
    })
    navigate('/')
  }

  const benefits = [
    { icon: Gift, text: `${TRIAL_LEADS} gratis lead-krediter` },
    { icon: Shield, text: `${TRIAL_DAYS} dagars fri provperiod` },
    { icon: MessageCircle, text: 'Inbyggd chatt med beställare' },
    { icon: CreditCard, text: 'Inget kreditkort krävs' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
          <div className="relative p-8 lg:p-16 flex flex-col justify-center text-white overflow-hidden" style={{ background: 'linear-gradient(160deg, hsl(245 62% 38%), hsl(245 58% 48%), hsl(260 50% 42%))' }}>
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 blur-3xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 max-w-xl">
              <span className="text-5xl mb-6 block" aria-hidden="true">🎁</span>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-3">Prova Updro gratis</h1>
              <p className="text-white/75 mb-8 text-lg">Skapa en synlig byråprofil och välj själv vilka uppdrag ni vill svara på.</p>

              <div className="space-y-4 mb-10">
                {benefits.map(benefit => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/10 p-2"><benefit.icon className="h-5 w-5 text-white" /></div>
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <p className="font-semibold">Nylanserad marknadsplats</p>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Updro bygger nu upp sitt nätverk av seriösa svenska byråer och beställare. Därför får nya byråer prova de första leadsen utan kostnad och utan kortuppgifter.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-16 flex items-center">
            <div className="w-full max-w-lg mx-auto">
              <h2 className="font-display text-2xl font-bold mb-2">Skapa byråkonto</h2>
              <p className="text-sm text-muted-foreground mb-6">Tar bara några minuter. Ni kan komplettera profilen efteråt.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier-company">Byrånamn *</Label>
                    <Input id="supplier-company" autoComplete="organization" maxLength={160} value={form.company_name} onChange={event => setForm(prev => ({ ...prev, company_name: event.target.value }))} className="rounded-xl mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="supplier-name">Ditt namn *</Label>
                    <Input id="supplier-name" autoComplete="name" maxLength={120} value={form.full_name} onChange={event => setForm(prev => ({ ...prev, full_name: event.target.value }))} className="rounded-xl mt-1" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="supplier-email">E-post *</Label>
                  <Input id="supplier-email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} className="rounded-xl mt-1" required />
                </div>
                <div>
                  <Label htmlFor="supplier-password">Lösenord *</Label>
                  <Input id="supplier-password" type="password" autoComplete="new-password" value={form.password} onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))} className="rounded-xl mt-1" minLength={8} required />
                  <p className="mt-1 text-xs text-muted-foreground">Minst åtta tecken.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier-phone">Telefon</Label>
                    <Input id="supplier-phone" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="supplier-org">Org-nummer</Label>
                    <Input id="supplier-org" maxLength={32} value={form.org_number} onChange={event => setForm(prev => ({ ...prev, org_number: event.target.value }))} placeholder="XXXXXX-XXXX" className="rounded-xl mt-1" />
                  </div>
                </div>

                <div>
                  <Label>Kategorier (välj minst en) *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.map(category => {
                      const selected = form.categories.includes(category)
                      return (
                        <button key={category} type="button" aria-pressed={selected} onClick={() => toggleCategory(category)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${selected ? 'bg-brand-blue text-primary-foreground border-brand-blue' : 'bg-card text-foreground/70 border-border hover:border-brand-blue/50'}`}>
                          <span aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                          {category}
                          {selected && <Check className="h-3 w-3" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox id="supplier-terms" checked={form.accepted} onCheckedChange={value => setForm(prev => ({ ...prev, accepted: value === true }))} />
                  <label htmlFor="supplier-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                    Jag godkänner <Link to="/villkor" className="text-brand-blue hover:underline">villkoren</Link> och{' '}
                    <Link to="/integritetspolicy" className="text-brand-blue hover:underline">integritetspolicyn</Link> *
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="supplier-newsletter" checked={form.newsletter} onCheckedChange={value => setForm(prev => ({ ...prev, newsletter: value === true }))} />
                  <label htmlFor="supplier-newsletter" className="text-xs text-muted-foreground leading-tight cursor-pointer">Ja, jag vill ta emot nyheter och tips via e-post</label>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl py-6 text-base font-semibold">
                  {loading ? 'Skapar konto...' : <>Skapa konto och få {TRIAL_LEADS} gratis leads<ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">🔒 Säker registrering · Inga kortuppgifter · Ingen bindningstid</p>
              <p className="text-center text-sm text-muted-foreground mt-5">Har ni redan konto? <Link to="/logga-in" className="text-primary hover:underline font-medium">Logga in</Link></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default RegisterSupplierPage
