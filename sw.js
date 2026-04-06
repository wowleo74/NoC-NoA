const CACHE_NAME = 'noc-noa-cache-v2';

// 💡 핵심 수정: 모든 파일 경로를 상대경로('./')로 통일하여 GitHub Pages 하위 폴더에서도 완벽 작동하게 만듭니다.
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/ui.js',
  './icon.png',
  './manifest.json',
  './privacy.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // 캐시에 있으면 캐시된 파일 반환 (오프라인 지원)
        }
        return fetch(event.request); // 없으면 네트워크에서 가져오기
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 새 버전이 나오면 이전 캐시 삭제
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});