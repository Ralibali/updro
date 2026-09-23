import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'
import { Mail, Lock, FileText, MessageSquare, ListChecks } from 'lucide-react'
import { setSEOMeta } from '@/lib/seoHelpers'

const LoginPage = () => {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSEOMeta({
      title: 'Logga in | Updro',
      description:
        'Logga in på ditt Updro-konto för att hantera uppdrag, offerter och meddelanden.',
      canonical: 'https://updro.se/logga-in',
      noindex: true
    })
  }, [])

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast.success('E-postadressen är bekräftad. Logga in för att fortsätta.')
      window.history.replaceState({}, '', '/logga-in')
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    const { error } = await signIn(email.trim().toLowerCase(), password)
    setLoading(false)

    if (error) {
      toast.error(
        'Kunde inte logga in. Kontrollera uppgifterna och att e-postadressen är bekräftad.'
      )
    } else {
      toast.success('Inloggad!')
    }
  }

  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true })
      else if (profile.role === 'supplier')
        navigate('/dashboard/supplier', { replace: true })
      else if (profile.role === 'buyer')
        navigate('/dashboard/buyer', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [profile, navigate])

  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="updro-auth-main">
        <div className="updro-auth-layout">
          <aside className="updro-auth-aside">
            <span className="updro-eyebrow">Din arbetsyta på Updro</span>
            <h2>
              Projekt, offerter och dialog.
              <br />
              Samlat på ett ställe.
            </h2>
            <p>
              Fortsätt där du slutade. När du loggar in kommer du till
              arbetsytan för ditt konto.
            </p>
            <div className="mt-8 space-y-5">
              {[
                { icon: FileText, label: 'Följ dina pågående uppdrag' },
                {
                  icon: ListChecks,
                  label: 'Gå igenom offerter och nästa steg'
                },
                { icon: MessageSquare, label: 'Håll kontakten genom projektet' }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  {item.label}
                </div>
              ))}
            </div>
          </aside>
          <div className="updro-auth-panel">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold">Logga in</h1>
              <p className="text-muted-foreground mt-2">
                Använd e-postadressen som hör till ditt konto.
              </p>
            </div>

            <div className="bg-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="din@email.se"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Lösenord</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover text-primary-foreground rounded-xl py-5"
                >
                  {loading ? 'Loggar in...' : 'Logga in'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <Link
                  to="/aterstall-losenord"
                  className="text-brand-blue hover:underline"
                >
                  Glömt lösenord?
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Inget konto?{' '}
              <Link
                to="/registrera"
                className="text-brand-blue hover:underline font-medium"
              >
                Registrera dig
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default LoginPage
