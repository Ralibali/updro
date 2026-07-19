import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/usePushNotifications'

/**
 * Opt-in-kort för pushnotiser. Renderas bara när webbläsaren stödjer
 * web push OCH VITE_VAPID_PUBLIC_KEY är satt – annars osynligt.
 */
const PushNotificationCard = () => {
  const { state, busy, subscribe, unsubscribe } = usePushNotifications()

  if (state === 'unsupported') return null

  const enable = async () => {
    const ok = await subscribe()
    if (ok) {
      toast.success('Pushnotiser aktiverade på den här enheten.')
    } else {
      toast.error('Kunde inte aktivera pushnotiser. Kontrollera webbläsarens tillåtelse.')
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
        {state === 'subscribed' ? (
          <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
        ) : (
          <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Pushnotiser</p>
        {state === 'subscribed' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Aktiverade på den här enheten – du får viktiga händelser direkt även när sajten är stängd.
          </p>
        )}
        {state === 'prompt' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Få viktiga händelser direkt på enheten – nya offerter, meddelanden och avtal att bekräfta.
          </p>
        )}
        {state === 'denied' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Blockerade i webbläsaren. Ändra under webbplatsinställningar om du vill slå på dem.
          </p>
        )}
      </div>
      {state === 'prompt' && (
        <Button size="sm" onClick={enable} disabled={busy} className="shrink-0">
          {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Aktivera
        </Button>
      )}
      {state === 'subscribed' && (
        <Button size="sm" variant="outline" onClick={unsubscribe} disabled={busy} className="shrink-0 gap-1.5">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />} Stäng av
        </Button>
      )}
    </div>
  )
}

export default PushNotificationCard
