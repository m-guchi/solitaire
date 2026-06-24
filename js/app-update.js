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

function reloadAttemptKey(version) {
  return `solitaire-update-reload-${version}`;
}

function readSessionItem(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionItem(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // private browsing など
  }
}

function removeSessionItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // private browsing など
  }
}

function clearUpdateReloadMarker(version) {
  removeSessionItem(reloadAttemptKey(version));
}

function hasRecentUpdateReload(version) {
  return readSessionItem(reloadAttemptKey(version)) === '1';
}

function markUpdateReload(version) {
  writeSessionItem(reloadAttemptKey(version), '1');
}

function stripAppUpdatedParam() {
  const url = new URL(location.href);
  if (!url.searchParams.has('appUpdated')) return;
  url.searchParams.delete('appUpdated');
  history.replaceState(null, '', url.toString());
}

export function initAppUpdate(currentVersion, { canApplyUpdate = () => true } = {}) {
  let registration = null;
  let updateTriggered = false;
  let reloadPending = false;
  let pendingUpdate = false;

  stripAppUpdatedParam();

  const reloadForUpdate = () => {
    if (reloadPending) return;
    if (hasRecentUpdateReload(currentVersion)) {
      clearUpdateReloadMarker(currentVersion);
      return;
    }

    reloadPending = true;
    markUpdateReload(currentVersion);
    const url = new URL(location.href);
    url.searchParams.set('appUpdated', Date.now().toString());
    location.replace(url.toString());
  };

  const activateWaitingWorker = () => {
    if (!registration?.waiting) return false;
    updateTriggered = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
  };

  const tryApplyUpdate = () => {
    if (!pendingUpdate && !registration?.waiting) return;

    if (!canApplyUpdate()) {
      pendingUpdate = true;
      return;
    }

    pendingUpdate = false;

    if (activateWaitingWorker()) return;
    reloadForUpdate();
  };

  const markUpdateReady = () => {
    pendingUpdate = true;
    tryApplyUpdate();
  };

  const trackInstallingWorker = (worker) => {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        markUpdateReady();
      }
    });
  };

  const checkRemoteVersion = async () => {
    try {
      const response = await fetch(
        `${resolveAssetUrl('js/changelog.js')}?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      if (!response.ok) return;
      const remoteVersion = parseAppVersion(await response.text());
      if (!remoteVersion || remoteVersion === currentVersion) {
        clearUpdateReloadMarker(currentVersion);
        return;
      }

      pendingUpdate = true;

      if (registration) {
        await registration.update().catch(() => {});
        if (registration.waiting) {
          tryApplyUpdate();
          return;
        }
        if (registration.installing) {
          trackInstallingWorker(registration.installing);
          return;
        }
      }

      tryApplyUpdate();
    } catch {
      // オフラインなどは無視
    }
  };

  const initServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      void checkRemoteVersion();
      return;
    }

    try {
      registration = await navigator.serviceWorker.register(resolveAssetUrl('sw.js'), {
        scope: typeof window.getBasePath === 'function' ? window.getBasePath() : getBasePath(),
      });

      if (registration.waiting && navigator.serviceWorker.controller) {
        markUpdateReady();
      }

      registration.addEventListener('updatefound', () => {
        trackInstallingWorker(registration.installing);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!updateTriggered) return;
        reloadForUpdate();
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

    void checkRemoteVersion();
  };

  void initServiceWorker();

  return { applyPendingUpdate: tryApplyUpdate };
}
