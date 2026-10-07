import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ResendConfirmation from '@/components/ResendConfirmation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { setSEOMeta } from '@/lib/seoHelpers'

export default function ConfirmEmailPage() {
  const [verification] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
    return { token: params.get('token_hash'), type: params.get('type') }
  })
  const validLink = Boolean(verification.token && ['email', 'signup'].includes(verification.type || ''))
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>(validLink ? 'ready' : 'error')
  const [email, setEmail] = useState('')
  const busy = useRef(false)

  useEffect(() => {
    window.history.replaceState(window.history.state, '', '/bekrafta-epost')
    setSEOMeta({ title: 'Bekräfta e-post | Updro', description: 'Bekräfta din e-postadress för ditt Updro-konto.', canonical: 'https://updro.se/bekrafta-epost', noindex: true })
  }, [])

  const confirm = async () => {
    if (!validLink || busy.current || status === 'success') return
    busy.current = true
    setStatus('loading')
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: verification.token!, type: 'email' })
      setStatus(error ? 'error' : 'success')
    } catch {
      setStatus('error')
    } finally {
      busy.current = false
    }
  }

  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="updro-auth-main">
        <div className="updro-auth-panel">
          <h1 className="font-display text-3xl font-bold">Bekräfta e-post</h1>
          {status === 'ready' || status === 'loading' ? (
            <>
              <p className="mt-4 text-muted-foreground">Bekräfta din e-postadress för att öppna ditt konto på Updro.</p>
              <Button className="mt-6" onClick={confirm} disabled={status === 'loading'}>{status === 'loading' ? 'Bekräftar...' : 'Bekräfta min e-post'}</Button>
            </>
          ) : status === 'success' ? (
            <div role="status" className="mt-4">
              <p>Din e-postadress är bekräftad.</p>
              <Button asChild className="mt-6"><Link to="/logga-in">Fortsätt till mitt konto</Link></Button>
            </div>
          ) : (
            <div className="mt-4">
              <p role="alert">Länken kunde inte bekräftas. Den kan ha gått ut eller redan använts. Prova att logga in eller begär ett nytt mejl.</p>
              <div className="mt-5">
                <Label htmlFor="confirmation-email">E-post</Label>
                <Input id="confirmation-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1" />
              </div>
              <ResendConfirmation email={email} />
              <Link to="/logga-in" className="mt-5 inline-block text-primary underline">Till inloggningen</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
