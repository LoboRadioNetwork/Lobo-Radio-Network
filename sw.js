// Service worker for the Lobo Radio Network web player.
// Required for the "install app" prompt.
// v36: NETWORK-FIRST for pages and styles so site edits show immediately;
// cache is only a fallback for offline. (Cache-first made returning
// browsers lag one or more deploys behind — fixed Nov 25, 2026.)
const CACHE = 'lobo-radio-v36';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Stream audio and video straight from the network.
  if (e.request.url.includes('live365') || e.request.destination === 'audio' || e.request.destination === 'video') return;
  // Everything else: network first, cache fallback, keep cache fresh.
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
