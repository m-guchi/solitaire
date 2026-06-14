const STORAGE_KEY = 'solitaire-stats';

const MODE_KEYS = ['normal', 'vegas', 'cumulative'];

export const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesCleared: 0,
  byMode: {
    normal: { played: 0, cleared: 0, totalClearMoves: 0, totalClearSeconds: 0 },
    vegas: { played: 0, cleared: 0, totalClearMoves: 0, totalClearSeconds: 0 },
    cumulative: { played: 0, cleared: 0, totalClearMoves: 0, totalClearSeconds: 0 },
  },
};

function normalizeModeStats(raw) {
  const byMode = { ...DEFAULT_STATS.byMode };
  for (const key of MODE_KEYS) {
    const entry = raw?.[key];
    if (entry && typeof entry === 'object') {
      byMode[key] = {
        played: Number.isFinite(entry.played) ? Math.max(0, entry.played) : 0,
        cleared: Number.isFinite(entry.cleared) ? Math.max(0, entry.cleared) : 0,
        totalClearMoves: Number.isFinite(entry.totalClearMoves) ? Math.max(0, entry.totalClearMoves) : 0,
        totalClearSeconds: Number.isFinite(entry.totalClearSeconds) ? Math.max(0, entry.totalClearSeconds) : 0,
      };
    }
  }
  return byMode;
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATS));
    const data = JSON.parse(raw);
    return {
      gamesPlayed: Number.isFinite(data.gamesPlayed) ? Math.max(0, data.gamesPlayed) : 0,
      gamesCleared: Number.isFinite(data.gamesCleared) ? Math.max(0, data.gamesCleared) : 0,
      byMode: normalizeModeStats(data.byMode),
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STATS));
  }
}

function persistStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGamePlayed(mode = 'normal') {
  const stats = loadStats();
  const modeKey = MODE_KEYS.includes(mode) ? mode : 'normal';
  stats.gamesPlayed += 1;
  stats.byMode[modeKey].played += 1;
  persistStats(stats);
}

export function recordGameCleared(mode = 'normal', { moves, seconds } = {}) {
  const stats = loadStats();
  const modeKey = MODE_KEYS.includes(mode) ? mode : 'normal';
  stats.gamesCleared += 1;
  stats.byMode[modeKey].cleared += 1;
  if (Number.isFinite(moves)) {
    stats.byMode[modeKey].totalClearMoves += moves;
  }
  if (Number.isFinite(seconds)) {
    stats.byMode[modeKey].totalClearSeconds += seconds;
  }
  persistStats(stats);
}

export function getClearRate(stats) {
  if (!stats.gamesPlayed) return null;
  return (stats.gamesCleared / stats.gamesPlayed) * 100;
}

export function formatClearRate(rate) {
  if (rate == null) return '—';
  return `${rate.toFixed(1)}%`;
}

export function getModeClearRate(played, cleared) {
  if (!played) return null;
  return (cleared / played) * 100;
}

export function getVegasModeStats(stats) {
  return {
    played: stats.byMode.vegas.played + stats.byMode.cumulative.played,
    cleared: stats.byMode.vegas.cleared + stats.byMode.cumulative.cleared,
    totalClearMoves: stats.byMode.vegas.totalClearMoves + stats.byMode.cumulative.totalClearMoves,
    totalClearSeconds: stats.byMode.vegas.totalClearSeconds + stats.byMode.cumulative.totalClearSeconds,
  };
}

export function resetStats() {
  localStorage.removeItem(STORAGE_KEY);
}
