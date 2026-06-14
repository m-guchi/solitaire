const STORAGE_KEY = 'solitaire-rankings';

export const CLEAR_MODES = {
  normal: 'ノーマル',
  vegas: 'ベガス',
  cumulative: '累計ベガス',
};

export function formatClearMode(mode) {
  return CLEAR_MODES[mode] ?? CLEAR_MODES.normal;
}

export function resolveClearMode({ vegasMode, cumulativeVegas }) {
  if (!vegasMode) return 'normal';
  if (cumulativeVegas) return 'cumulative';
  return 'vegas';
}

export function loadRankings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function persistRankings(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveClearRecord({ clearedAt, seconds, moves, mode = 'normal' }) {
  const entries = loadRankings();
  entries.push({
    clearedAt,
    seconds,
    moves,
    mode,
  });
  persistRankings(entries);
}

export function getTopRankings(sortBy = 'time', limit = 10) {
  const entries = loadRankings();
  const sorted = [...entries].sort((a, b) => {
    if (sortBy === 'moves') {
      return a.moves - b.moves || a.seconds - b.seconds || b.clearedAt - a.clearedAt;
    }
    return a.seconds - b.seconds || a.moves - b.moves || b.clearedAt - a.clearedAt;
  });
  return sorted.slice(0, limit);
}

export function resetRankings() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getClearAveragesByMode() {
  const result = {
    normal: { clears: 0, totalMoves: 0, totalSeconds: 0 },
    vegas: { clears: 0, totalMoves: 0, totalSeconds: 0 },
    cumulative: { clears: 0, totalMoves: 0, totalSeconds: 0 },
  };
  for (const entry of loadRankings()) {
    const mode = entry.mode ?? 'normal';
    if (!result[mode]) continue;
    result[mode].clears += 1;
    result[mode].totalMoves += Number.isFinite(entry.moves) ? entry.moves : 0;
    result[mode].totalSeconds += Number.isFinite(entry.seconds) ? entry.seconds : 0;
  }
  return result;
}

export function getCombinedVegasClearAverages(clearAvgs) {
  return {
    clears: clearAvgs.vegas.clears + clearAvgs.cumulative.clears,
    totalMoves: clearAvgs.vegas.totalMoves + clearAvgs.cumulative.totalMoves,
    totalSeconds: clearAvgs.vegas.totalSeconds + clearAvgs.cumulative.totalSeconds,
  };
}
