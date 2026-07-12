import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNoindex } from '@/hooks/useNoindex'
import { supabase } from '@/integrations/supabase/client'
import { setSEOMeta } from '@/lib/seoHelpers'
import { Loader2, Mail, LockKeyhole } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description?: string
}

const PasswordRecovery = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hasRecoveryToken = window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')
    if (hasRecoveryToken) setRecoveryMode(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/aterstall-losenord`,
    })

    setLoading(false)
    if (resetError) {
      setError('Kunde inte skicka återställningslänken. Kontrollera adressen och försök igen.')
      return
    }

    setMessage('Om adressen finns registrerad har vi skickat en återställningslänk. Kontrollera även skräpposten.')
  }

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 8) {
      setError('Lösenordet måste vara minst åtta tecken.')
      return
    }
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Länken är ogiltig eller har gått ut. Begär en ny återställningslänk.')
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('Ditt lösenord har uppdaterats. Du kan nu logga in.')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Återställ lösenord</h1>
            <p className="text-muted-foreground mt-2">
              {recoveryMode ? 'Välj ett nytt lösenord för ditt Updro-konto.' : 'Vi skickar en säker återställningslänk till din e-post.'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            {recoveryMode ? (
              <form onSubmit={updatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nytt lösenord</Label>
                  <div className="relative mt-1">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} className="pl-10 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Bekräfta lösenord</Label>
                  <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="rounded-xl mt-1" />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-xl py-5">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Spara nytt lösenord
                </Button>
              </form>
            ) : (
              <form onSubmit={requestReset} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">E-post</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="pl-10 rounded-xl" placeholder="din@email.se" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-xl py-5">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Skicka återställningslänk
                </Button>
              </form>
            )}

            {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
            {message && <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-foreground" role="status">{message}</p>}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/logga-in" className="text-primary hover:underline">Tillbaka till inloggningen</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  useNoindex()
  useEffect(() => {
    setSEOMeta({
      title: `${title} | Updro`,
      description: description || (title === 'Återställ lösenord' ? 'Återställ lösenordet till ditt Updro-konto.' : 'Denna sida är under konstruktion.'),
      noindex: true,
    })
  }, [title, description])

  if (title === 'Återställ lösenord') return <PasswordRecovery />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground">{description || 'Denna sida är under konstruktion.'}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PlaceholderPage
