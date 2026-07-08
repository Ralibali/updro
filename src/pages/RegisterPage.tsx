import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, User } from 'lucide-react'
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
import { setSEOMeta } from '@/lib/seoHelpers'

const RegisterPage = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledEmail = searchParams.get('email')?.trim().toLowerCase() || ''
  const linkedProject = searchParams.get('project') || ''
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: prefilledEmail,
    password: '',
    acceptedTerms: false,
    newsletter: false,
  })

  useEffect(() => {
    setSEOMeta({
      title: 'Registrera dig – Skapa gratis konto | Updro',
      description: 'Skapa ett gratis konto på Updro och börja publicera uppdrag eller registrera din byrå.',
      canonical: 'https://updro.se/registrera',
      noindex: true,
    })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    if (!form.acceptedTerms) {
      toast.error('Du måste godkänna villkoren.')
      return
    }

    const email = form.email.trim().toLowerCase()
    setLoading(true)
    const { error } = await signUp({
      email,
      password: form.password,
      role: 'buyer',
      full_name: form.full_name.trim(),
    })

    if (error) {
      setLoading(false)
      toast.error(error.message || 'Något gick fel.')
      return
    }

    if (form.newsletter) {
      const { error: newsletterError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'buyer_registration' })

      if (newsletterError && newsletterError.code !== '23505') {
        console.warn('Newsletter opt-in could not be saved', newsletterError)
      }
    }

    trackSignUp('buyer')
    setLoading(false)
    toast.success('Konto skapat! Kolla din inkorg (och skräpposten) för att bekräfta din e-post.', {
      duration: 8000,
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Skapa gratis konto</h1>
            <p className="text-muted-foreground mt-2">Följ dina uppdrag och offerter på ett ställe.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-2xl border-2 border-brand-blue p-5 text-center" aria-current="true">
              <User className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
              <h2 className="font-display font-semibold text-sm">Beställare</h2>
              <p className="text-xs text-muted-foreground mt-1">Publicera uppdrag gratis</p>
            </div>
            <Link to="/registrera/byra" className="bg-card rounded-2xl border p-5 text-center hover:border-brand-blue transition-colors">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h2 className="font-display font-semibold text-sm">Byrå</h2>
              <p className="text-xs text-muted-foreground mt-1">Få fem gratis leads</p>
            </Link>
          </div>

          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="buyer-name">Namn *</Label>
                <Input id="buyer-name" autoComplete="name" maxLength={120} value={form.full_name} onChange={event => setForm(prev => ({ ...prev, full_name: event.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label htmlFor="buyer-email">E-post *</Label>
                <Input id="buyer-email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label htmlFor="buyer-password">Lösenord *</Label>
                <Input id="buyer-password" type="password" autoComplete="new-password" value={form.password} onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))} className="rounded-xl mt-1" minLength={6} required />
                <p className="mt-1 text-xs text-muted-foreground">Minst sex tecken.</p>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox id="buyer-terms" checked={form.acceptedTerms} onCheckedChange={value => setForm(prev => ({ ...prev, acceptedTerms: value === true }))} />
                <label htmlFor="buyer-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  Jag godkänner <Link to="/villkor" className="text-brand-blue hover:underline">villkoren</Link> och{' '}
                  <Link to="/integritetspolicy" className="text-brand-blue hover:underline">integritetspolicyn</Link> *
                </label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="buyer-newsletter" checked={form.newsletter} onCheckedChange={value => setForm(prev => ({ ...prev, newsletter: value === true }))} />
                <label htmlFor="buyer-newsletter" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  Ja, jag vill ta emot nyheter och tips via e-post
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-brand-blue hover:bg-brand-blue-hover text-primary-foreground rounded-xl py-5">
                {loading ? 'Skapar konto...' : 'Skapa beställarkonto'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Har du konto? <Link to="/logga-in" className="text-brand-blue hover:underline font-medium">Logga in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default RegisterPage
