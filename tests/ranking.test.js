import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  formatClearMode,
  resolveClearMode,
  saveClearRecord,
  getTopRankings,
  resetRankings,
} from '../js/ranking.js';
import { installLocalStorageMock } from './helpers/local-storage.js';

beforeEach(() => {
  installLocalStorageMock();
});

describe('resolveClearMode', () => {
  it('maps settings to clear mode keys', () => {
    assert.equal(resolveClearMode({ vegasMode: false }), 'normal');
    assert.equal(resolveClearMode({ vegasMode: true, cumulativeVegas: false }), 'vegas');
    assert.equal(resolveClearMode({ vegasMode: true, cumulativeVegas: true }), 'cumulative');
  });
});

describe('formatClearMode', () => {
  it('returns Japanese labels', () => {
    assert.equal(formatClearMode('vegas'), 'ベガス');
    assert.equal(formatClearMode('unknown'), 'ノーマル');
  });
});

describe('getTopRankings', () => {
  it('sorts by time then moves', () => {
    saveClearRecord({ clearedAt: 1, seconds: 120, moves: 80, mode: 'normal' });
    saveClearRecord({ clearedAt: 2, seconds: 90, moves: 100, mode: 'normal' });
    saveClearRecord({ clearedAt: 3, seconds: 90, moves: 70, mode: 'normal' });

    const byTime = getTopRankings('time', 3);
    assert.deepEqual(byTime.map((entry) => entry.moves), [70, 100, 80]);

    resetRankings();
    saveClearRecord({ clearedAt: 1, seconds: 120, moves: 80, mode: 'normal' });
    saveClearRecord({ clearedAt: 2, seconds: 90, moves: 100, mode: 'normal' });

    const byMoves = getTopRankings('moves', 2);
    assert.deepEqual(byMoves.map((entry) => entry.moves), [80, 100]);
  });
});
