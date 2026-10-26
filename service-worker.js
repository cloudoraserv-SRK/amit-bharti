const CACHE_NAME = 'ab-ad-world-shell-v13';
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './commerce.js',
  './seo.js',
  './service-catalog.js',
  './image-gallery.js',
  './service.html',
  './supabase-config.js',
  './manifest.webmanifest',
  './assets/svg/logo.svg',
  './assets/logo/logo.jpg',
  './assets/images/work-samples/retroreflective-sign.jpg',
  './assets/images/work-samples/vinyl-print.jpg',
  './assets/images/work-samples/printed-canopy.jpg',
  './assets/images/work-samples/display-stand.jpg',
  './assets/images/work-samples/promotional-board.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('ab-ad-world-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || caches.match('./index.html');
    }));
    return;
  }

  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })));
  }
});
