const CACHE_NAME = 'nodam-nosul-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/data.js',
    '/js/ui.js',
    '/icon.png',
    '/manifest.json'
];

// 1. 설치: 캐시 저장
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting(); // 즉시 활성화
});

// 2. 활성화: 옛날 버전 캐시 쓰레기통에 버리기
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. 인터넷 요청: [네트워크 먼저] -> 실패 시 [캐시] 
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 네트워크 성공 시 새로운 데이터로 캐시 업데이트
                if (response && response.status === 200) {
                    let responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // 인터넷이 끊겼을 때만 캐시에서 가져오기
                return caches.match(event.request);
            })
    );
});