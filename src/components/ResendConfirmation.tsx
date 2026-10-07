import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { confirmationErrorMessage } from '@/lib/authMessages'
import { Button } from '@/components/ui/button'

export default function ResendConfirmation({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const busy = useRef(false)
  const normalizedEmail = email.trim().toLowerCase()
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = window.setTimeout(() => setRemaining(value => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [remaining])

  const resend = async () => {
    if (!validEmail || busy.current || remaining > 0) return
    busy.current = true
    setSending(true)
    setMessage('')
    setError('')
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: { emailRedirectTo: 'https://updro.se/logga-in?confirmed=true' },
      })
      if (resendError) {
        setError(confirmationErrorMessage(resendError))
        if (resendError.status === 429 || resendError.code === 'over_email_send_rate_limit') setRemaining(60)
        return
      }
      setMessage('Om adressen har ett konto som väntar på bekräftelse skickas ett nytt mejl. Kontrollera även skräpposten.')
      setRemaining(60)
    } catch {
      setError('Mejltjänsten kunde inte nås. Kontrollera anslutningen och försök igen.')
    } finally {
      busy.current = false
      setSending(false)
    }
  }

  return (
    <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm">
      <p className="font-medium">Saknar du bekräftelsemejlet?</p>
      <p className="mt-1 text-muted-foreground">Ange din e-postadress i fältet ovan och begär ett nytt mejl.</p>
      <Button type="button" variant="outline" className="mt-3 h-auto min-h-10 whitespace-normal" onClick={resend} disabled={!validEmail || sending || remaining > 0}>
        {sending ? 'Skickar...' : remaining > 0 ? `Skicka igen om ${remaining} s` : 'Skicka bekräftelse igen'}
      </Button>
      {message && <p role="status" className="mt-3">{message}</p>}
      {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    </div>
  )
}
