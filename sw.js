// 라비 砢馡 Service Worker
const CACHE_NAME = 'ravi-v2';
const OFFLINE_URL = './index.html';

const STATIC_ASSETS = [
  './index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;500&display=swap',
];

// 설치
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 - 구버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API 요청은 캐시 안 함 (항상 네트워크)
  if(url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(
        JSON.stringify([]), {headers:{'Content-Type':'application/json'}}
      ))
    );
    return;
  }

  // 유튜브 썸네일은 캐시 우선
  if(url.hostname.includes('img.youtube.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // HTML 문서(index.html 등)는 항상 최신 네트워크 우선, 캐시는 오프라인 대비용
  if(e.request.mode === 'navigate' || (e.request.destination === 'document') || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // 나머지: 네트워크 우선, 실패시 캐시
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => {
        return cached || caches.match(OFFLINE_URL);
      }))
  );
});
