/* Updro service worker – snabb uppstart och grundläggande offline-stöd.
 * Navigering: network-first (färsk HTML när nätet finns, cache som fallback).
 * Statiska same-origin-resurser: cache-first med bakgrundsuppdatering.
 * API-anrop (t.ex. Supabase) cachas aldrig. */

const VERSION = 'updro-v2'
const STATIC_CACHE = `${VERSION}-static`
const PAGE_CACHE = `${VERSION}-pages`
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon.png']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(PAGE_CACHE).then(cache => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/'))),
    )
    return
  }

  if (/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetched = fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy))
          }
          return response
        })
        return cached || fetched
      }),
    )
  }
})

/* Web push: visa notisen även när sajten är stängd. */
self.addEventListener('push', event => {
  if (!event.data) return
  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Updro', body: event.data.text() }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Updro', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { link: data.link || '/' },
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const link = event.notification.data?.link || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(link)
          return client.focus()
        }
      }
      return clients.openWindow(link)
    }),
  )
})
