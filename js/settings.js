const STORAGE_KEY = 'solitaire-settings';
const VEGAS_SCORE_KEY = 'solitaire-vegas-score';

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vegasMode: false,
  cumulativeVegas: false,
  easyMove: false,
};

export const SETTING_HELP = {
  sound: {
    title: 'サウンド',
    body: 'カードの移動やめくりなど、ゲーム中の効果音をオン・オフします。',
  },
  vegas: {
    title: 'ベガスモード',
    body: '山札は1回のみめくれます。組札にカードを置くと+$5、1ゲームの開始時に-$52されます。',
  },
  cumulativeVegas: {
    title: '累計ベガスモード',
    body: 'ベガスモードのスコアをゲームをまたいで累計します。設定画面から累計スコアをリセットできます。ゲームモードを変更しても累計スコアは保持されます。',
  },
  easyMove: {
    title: '簡単移動',
    body: '移動可能なカードをタップするだけで、自動的に移動先へ送ります。場札をタップすると、その場所へ置けるカードを自動で探して移動します。',
  },
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadVegasScore() {
  try {
    const raw = localStorage.getItem(VEGAS_SCORE_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function saveVegasScore(score) {
  localStorage.setItem(VEGAS_SCORE_KEY, String(score));
}
