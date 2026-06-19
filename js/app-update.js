export function parseAppVersion(source) {
  const match = /export const APP_VERSION = '([^']+)'/.exec(source);
  return match?.[1] ?? null;
}

function getBasePath() {
  const path = location.pathname;
  if (path.endsWith('/')) return path;
  const last = path.split('/').pop() || '';
  return /\.[a-z0-9]+$/i.test(last) ? path.replace(/\/[^/]*$/, '/') : `${path}/`;
}

function resolveAssetUrl(relativePath) {
  if (typeof window.assetUrl === 'function') {
    return window.assetUrl(relativePath);
  }
  const basePath = typeof window.getBasePath === 'function'
    ? window.getBasePath()
    : getBasePath();
  return `${location.origin}${basePath}${String(relativePath).replace(/^\.\//, '')}`;
}

export function initAppUpdate(currentVersion, { shouldShowBar = () => true } = {}) {
  const bar = document.getElementById('app-update-bar');
  const button = document.getElementById('btn-app-update');
  if (!bar || !button) return null;

  let pendingVersion = null;
  let registration = null;
  let userRequestedUpdate = false;
  let updateAvailable = false;

  const syncBarVisibility = () => {
    bar.classList.toggle('hidden', !updateAvailable || !shouldShowBar());
  };

  const showBar = (nextVersion = null) => {
    if (nextVersion) pendingVersion = nextVersion;
    updateAvailable = true;
    const message = bar.querySelector('.app-update-message');
    if (message) {
      message.textContent = pendingVersion
        ? `新しいバージョン（v${pendingVersion}）があります`
        : '新しいバージョンがあります';
    }
    syncBarVisibility();
  };

  const applyUpdate = async () => {
    userRequestedUpdate = true;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set('appUpdated', Date.now().toString());
    location.replace(url.toString());
  };

  button.addEventListener('click', () => {
    void applyUpdate();
  });

  const checkRemoteVersion = async () => {
    try {
      const response = await fetch(
        `${resolveAssetUrl('js/changelog.js')}?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      if (!response.ok) return;
      const remoteVersion = parseAppVersion(await response.text());
      if (remoteVersion && remoteVersion !== currentVersion) {
        showBar(remoteVersion);
      }
    } catch {
      // オフラインなどは無視
    }
  };

  const trackWaitingWorker = (worker) => {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        showBar(pendingVersion);
      }
    });
  };

  const initServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      registration = await navigator.serviceWorker.register(resolveAssetUrl('sw.js'), {
        scope: typeof window.getBasePath === 'function' ? window.getBasePath() : getBasePath(),
      });

      if (registration.waiting) {
        showBar();
      }

      registration.addEventListener('updatefound', () => {
        trackWaitingWorker(registration.installing);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!userRequestedUpdate) return;
        const url = new URL(location.href);
        url.searchParams.set('appUpdated', Date.now().toString());
        location.replace(url.toString());
      });

      const refreshRegistration = () => {
        registration.update().catch(() => {});
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          refreshRegistration();
          void checkRemoteVersion();
        }
      });

      window.setInterval(refreshRegistration, 60 * 60 * 1000);
    } catch {
      // Service Worker 非対応・スコープエラー時はバージョン確認のみ
    }
  };

  void initServiceWorker();
  void checkRemoteVersion();

  return { syncBarVisibility };
}
