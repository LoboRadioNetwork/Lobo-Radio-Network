// Minimal service worker for the Lobo Radio Network web player.
// Required for the "install app" prompt. Cache name bump when updating.
const CACHE = 'lobo-radio-v19';
const ASSETS = ['./', './index.html', './mustang.html', './tejano.html', './manifest.json', './icon-192.png', './icon-512.png'];

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
  // Stream audio and video straight from the network; cache everything else first.
  if (e.request.url.includes('live365') || e.request.destination === 'audio' || e.request.destination === 'video') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
