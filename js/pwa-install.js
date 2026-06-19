export const INSTALL_HELP = {
  ios: {
    title: 'ホーム画面に追加（iPhone / iPad）',
    steps: [
      'Safari 画面下（または上）の共有ボタン（□に↑）をタップします',
      '「ホーム画面に追加」を選びます',
      '右上の「追加」をタップします',
    ],
    note: 'Safari 以外のブラウザでは表示されない場合があります。',
  },
  android: {
    title: 'ホーム画面に追加（Android）',
    steps: [
      'ブラウザ右上のメニュー（⋮）をタップします',
      '「アプリをインストール」または「ホーム画面に追加」を選びます',
      '表示に従って追加します',
    ],
  },
  desktop: {
    title: 'アプリとしてインストール',
    steps: [
      'アドレスバー右側のインストールアイコンをクリックします',
      '「インストール」を選びます',
    ],
    note: 'Chrome または Edge で利用できます。',
  },
};

export function detectInstallPlatform({
  userAgent = navigator.userAgent,
  maxTouchPoints = navigator.maxTouchPoints,
  platform = navigator.platform,
} = {}) {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    || (platform === 'MacIntel' && maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'desktop';
}

export function isStandaloneApp({
  displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches,
  navigatorStandalone = navigator.standalone === true,
} = {}) {
  if (displayModeStandalone) return true;
  if (navigatorStandalone) return true;
  return false;
}

export function getInstallHelp(env) {
  const key = detectInstallPlatform(env);
  return INSTALL_HELP[key] ?? INSTALL_HELP.desktop;
}

export function shouldShowInstallLink(env) {
  return !isStandaloneApp(env);
}
