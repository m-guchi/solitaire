const CACHE_VERSION = '1.3.1';

self.addEventListener('install', () => {
  // ユーザーが「更新する」を押すまで旧バージョンを維持する
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('solitaire-') && key !== `solitaire-${CACHE_VERSION}`)
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
