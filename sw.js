const CACHE_NAME = 'fsbp-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './images/okno.png',
  './images/avatar.png',
  './images/cover.jpg'
];

// Установка: кэшируем файлы
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: чистим старый кэш, если обновили версию
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Перехват запросов: сначала ищем в кэше, потом идем в сеть
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
