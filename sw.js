const CACHE_VERSION = '1.2.0';
const CACHE_NAME = `solitaire-${CACHE_VERSION}`;

self.addEventListener('install', () => {
  // ユーザーが「更新する」を押すまで旧バージョンを維持する
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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isDocument = event.request.mode === 'navigate'
    || path.endsWith('.html')
    || path.endsWith('/');
  const isModule = path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.webmanifest');

  if (!isDocument && !isModule) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: 'no-cache' });
      if (response.ok) return response;
    } catch {
      // fall through to cache
    }
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
