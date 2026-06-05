const CACHE = 'rabi-v6';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
});

self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request);}));
});
