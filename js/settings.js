const STORAGE_KEY = 'solitaire-settings';
const VEGAS_SCORE_KEY = 'solitaire-vegas-score';

export const DEAL_DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'やさしい' },
  { value: 'normal', label: '通常' },
  { value: 'hard', label: '難しい' },
  { value: 'veryHard', label: 'とても難しい' },
];

const VALID_DEAL_DIFFICULTIES = new Set(DEAL_DIFFICULTY_OPTIONS.map((o) => o.value));

const LEGACY_DEAL_DIFFICULTY = {
  random: 'veryHard',
};

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vegasMode: false,
  cumulativeVegas: false,
  dealDifficulty: 'normal',
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
  dealDifficulty: {
    title: '配札の難易度',
    body: '新しいゲーム開始時の配札を選びます。やさしい・通常・難しいはシミュレーションで見積もった1ゲームのベガス点数（開始時-$52、組札へ+$5）に近い配札を選びます。とても難しいは完全なランダム配札です。ベガス・ノーマルどちらのモードにも適用されます。',
  },
  easyMove: {
    title: '簡単移動',
    body: '移動可能なカードをタップするだけで、自動的に移動先へ送ります。場札をタップすると、その場所へ置けるカードを自動で探して移動します。',
  },
};

export function normalizeDealDifficulty(value) {
  if (VALID_DEAL_DIFFICULTIES.has(value)) return value;
  if (value in LEGACY_DEAL_DIFFICULTY) return LEGACY_DEAL_DIFFICULTY[value];
  return DEFAULT_SETTINGS.dealDifficulty;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    parsed.dealDifficulty = normalizeDealDifficulty(parsed.dealDifficulty);
    return parsed;
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
