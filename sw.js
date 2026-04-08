// 💡 1. 캐시 버전 관리: v3에서 v5로 올렸습니다. 
// 이렇게 숫자를 바꿔줘야 폰이 새로운 index.html과 style.css를 다시 받아갑니다!
const CACHE_NAME = 'nocnoa-cache-v5';

// 미리 저장해둘 핵심 파일 (정적 파일)
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/ui.js',
  './js/app.js'
];

// 💡 2. 설치(Install) 및 skipWaiting 적용
self.addEventListener('install', event => {
  // 새 버전이 발견되면 대기하지 말고 즉시 설치를 강제합니다.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 💡 3. 활성화(Activate) 및 찌꺼기 청소 (clientsClaim)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 현재 버전(CACHE_NAME)과 이름이 다른 옛날 창고는 전부 폭파합니다.
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 즉시 앱의 제어권을 뺏어옵니다.
  );
});

// 💡 4. 데이터 요청(Fetch): '네트워크 우선(Network-First)' 전략
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1단계: 무조건 인터넷(GitHub)에서 최신 파일을 먼저 달라고 요청합니다.
    fetch(event.request)
      .then(response => {
        // 인터넷 요청이 성공하면, 그 최신 파일을 캐시 창고에도 복사해 둡니다.
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response; // 유저에게는 최신 화면을 보여줍니다.
      })
      .catch(() => {
        // 2단계: 만약 오프라인(비행기 모드)이라서 인터넷 요청이 실패했다면?
        // 그때서야 캐시 창고에 저장된 예전 화면을 꺼내서 보여줍니다.
        return caches.match(event.request);
      })
  );
});