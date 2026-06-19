const CACHE_VERSION = '1.4.0';
const CACHE_NAME = `solitaire-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css?v=1.4.0',
  './manifest.webmanifest',
  './js/game.js?v=1.4.0',
  './js/app-update.js',
  './js/changelog.js',
  './js/deal-quality.js',
  './js/pwa-install.js',
  './js/ranking.js',
  './js/rules.js',
  './js/save.js',
  './js/settings.js',
  './js/sounds.js',
  './js/stats.js',
  './assets/apple-touch-icon.png?v=6',
  './assets/favicon-32.png?v=6',
  './assets/favicon.ico?v=6',
  './assets/icon-192.png?v=6',
  './assets/icon-512.png',
];

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isCacheableAsset(request) {
  const { pathname } = new URL(request.url);
  return /\.(html|css|js|png|ico|svg|webmanifest)$/.test(pathname)
    || pathname.endsWith('/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('solitaire-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!isSameOrigin(request)) return;

  if (request.cache === 'no-store') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && isCacheableAsset(request)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (request.mode === 'navigate') {
        return (await cache.match('./index.html'))
          ?? (await cache.match('./'))
          ?? Response.error();
      }
      return Response.error();
    }
  })());
});
