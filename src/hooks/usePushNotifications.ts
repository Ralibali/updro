import { useCallback, useEffect, useState } from 'react'
import { supabase as supabaseTyped } from '@/integrations/supabase/client'
// push_subscriptions not yet in generated types; cast to any for now
const supabase = supabaseTyped as unknown as any
import { useAuth } from '@/hooks/useAuth'
import { getVapidPublicKey, isPushSupported, urlBase64ToUint8Array } from '@/lib/pushUtils'

export type PushState = 'unsupported' | 'prompt' | 'subscribed' | 'denied'

/**
 * Hanterar web push-opt-in: prenumererar via Push API och sparar
 * prenumerationen i public.push_subscriptions så att edge-funktionen
 * send-push kan nå enheten. Kräver att VITE_VAPID_PUBLIC_KEY är satt.
 */
export const usePushNotifications = () => {
  const { user } = useAuth()
  const [state, setState] = useState<PushState>('unsupported')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    let cancelled = false
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => {
        if (!cancelled) setState(sub ? 'subscribed' : 'prompt')
      })
      .catch(() => {
        if (!cancelled) setState('prompt')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!user || !isPushSupported()) return false
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'prompt')
        return false
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey() as string) as BufferSource,
      })
      const keys = subscription.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: keys.keys?.p256dh || '',
          auth: keys.keys?.auth || '',
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' },
      )
      if (error) throw error
      setState('subscribed')
      return true
    } catch {
      return false
    } finally {
      setBusy(false)
    }
  }, [user])

  const unsubscribe = useCallback(async () => {
    setBusy(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
        await subscription.unsubscribe()
      }
      setState('prompt')
    } finally {
      setBusy(false)
    }
  }, [])

  return { state, busy, subscribe, unsubscribe }
}
