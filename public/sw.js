const CACHE_NAME = 'kirtijob-cache-v4';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  // Take over immediately instead of waiting for old tabs to close, so code
  // updates reach users on their next load rather than being held back by a
  // stale, already-running service worker.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Only handle same-origin requests; let API/cross-origin calls pass through.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Network-first: always try the latest version so deploys and code changes
  // apply immediately. Fall back to cache only when the network is unavailable.
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone))
          .catch(() => { /* cache write is best-effort */ });
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html').then(fallback =>
              fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
            );
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
      )
  );
});
