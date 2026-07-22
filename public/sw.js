const CACHE_NAME = 'chess-trainer-v1'
const MODEL_CACHE = 'chess-trainer-model-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== MODEL_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.hostname === 'huggingface.co' || url.hostname === 'cdn-lfs.huggingface.co') {
    event.respondWith(
      caches.open(MODEL_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone())
            }
            return response
          })
        }),
      ),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetched = fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone())
            }
            return response
          })
          return cached || fetched
        }),
      ),
    )
  }
})
