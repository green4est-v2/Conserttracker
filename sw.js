/* Makes the app open without a connection.
   Change the version number whenever you upload a new index.html, so phones pick up the update. */
const CACHE = 'concert-tracker-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Answer from the saved copy straight away, and refresh that copy in the background when online. */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const saved = await cache.match(event.request, { ignoreSearch: event.request.mode === 'navigate' });
      const fresh = fetch(event.request)
        .then(response => {
          if (response && (response.ok || response.type === 'opaque')) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => saved);
      return saved || fresh;
    })
  );
});
