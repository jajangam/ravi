const CACHE = 'rabi-v3';
const FILES = [
  'https://jajangam.github.io/ravi/',
  'https://jajangam.github.io/ravi/index.html',
  'https://jajangam.github.io/ravi/manifest.json',
  'https://jajangam.github.io/ravi/icon-192.png',
  'https://jajangam.github.io/ravi/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
