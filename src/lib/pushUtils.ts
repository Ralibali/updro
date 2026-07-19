/** Hjälpfunktioner för web push-prenumerationer. */

export const getVapidPublicKey = (): string | undefined =>
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) || undefined

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  typeof Notification !== 'undefined' &&
  !!getVapidPublicKey()

/** VAPID-nyckeln är base64url-kodad; Push API vill ha den som Uint8Array. */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}
