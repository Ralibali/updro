import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'
import { Building2, User } from 'lucide-react'
import { lovable } from '@/integrations/lovable/index'
import { setSEOMeta } from '@/lib/seoHelpers'

const RegisterPage = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    acceptedTerms: false,
    newsletter: false,
  })

  useEffect(() => {
    setSEOMeta({
      title: 'Registrera dig – Skapa gratis konto | Updro',
      description: 'Skapa ett gratis konto på Updro och börja publicera uppdrag eller registrera din byrå.',
      canonical: 'https://updro.se/registrera',
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.acceptedTerms) {
      toast.error('Du måste godkänna villkoren.')
      return
    }
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      role: 'buyer',
      full_name: form.full_name,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Något gick fel.')
    } else {
      toast.success('Konto skapat! Kolla din inkorg (och skräpposten) för att bekräfta din e-post.', {
        duration: 8000,
      })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Skapa konto</h1>
            <p className="text-muted-foreground mt-2">Välj kontotyp</p>
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-2xl border-2 border-brand-blue p-5 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
              <h3 className="font-display font-semibold text-sm">Beställare</h3>
              <p className="text-xs text-muted-foreground mt-1">Publicera uppdrag gratis</p>
            </div>
            <Link to="/registrera/byra" className="bg-card rounded-2xl border p-5 text-center hover:border-brand-blue transition-colors">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-display font-semibold text-sm">Byrå</h3>
              <p className="text-xs text-muted-foreground mt-1">Fem gratis leads</p>
            </Link>
          </div>

          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl py-5 mb-4 gap-3 font-medium"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth('google', {
                  redirect_uri: window.location.origin,
                })
                if (error) toast.error('Kunde inte registrera med Google.')
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Registrera med Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">eller</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Namn *</Label>
                <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label>E-post *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label>Lösenord *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="rounded-xl mt-1" minLength={6} required />
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="buyer-terms"
                  checked={form.acceptedTerms}
                  onCheckedChange={(v) => setForm(p => ({ ...p, acceptedTerms: v === true }))}
                />
                <label htmlFor="buyer-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  Jag godkänner <Link to="/villkor" className="text-brand-blue hover:underline">villkoren</Link> och{' '}
                  <Link to="/integritetspolicy" className="text-brand-blue hover:underline">integritetspolicyn</Link> *
                </label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="buyer-newsletter"
                  checked={form.newsletter}
                  onCheckedChange={(v) => setForm(p => ({ ...p, newsletter: v === true }))}
                />
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
            Har du konto?{' '}
            <Link to="/logga-in" className="text-brand-blue hover:underline font-medium">Logga in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default RegisterPage
