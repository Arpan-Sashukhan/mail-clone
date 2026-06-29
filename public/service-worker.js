const SHELL_CACHE = 'mailx-shell-v4'
const RUNTIME_CACHE = 'mailx-runtime-v4'
const GMAIL_CACHE = 'mailx-gmail-v4'
const APP_SHELL = [
  '/',
  '/inbox',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192.svg',
  '/pwa-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE, GMAIL_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)
  const cache = await caches.open(RUNTIME_CACHE)
  cache.put(request, response.clone())
  return response
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)

    if (response.ok || response.type === 'opaque') {
      cache.put(request, response.clone())
    }

    return response
  } catch {
    return (await cache.match(request)) || (fallbackUrl ? caches.match(fallbackUrl) : undefined) || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, SHELL_CACHE, '/offline.html'))
    return
  }

  if (url.hostname === 'gmail.googleapis.com' || url.hostname === 'www.googleapis.com') {
    event.respondWith(networkFirst(event.request, GMAIL_CACHE))
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request))
  }
})
