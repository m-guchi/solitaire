import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  formatClearRate,
  getClearRate,
  getModeClearRate,
  getVegasModeStats,
  recordGamePlayed,
  recordGameCleared,
  resetStats,
  loadStats,
} from '../js/stats.js';
import { installLocalStorageMock } from './helpers/local-storage.js';

beforeEach(() => {
  installLocalStorageMock();
  resetStats();
});

describe('formatClearRate', () => {
  it('formats percentages and missing values', () => {
    assert.equal(formatClearRate(null), '—');
    assert.equal(formatClearRate(66.666), '66.7%');
  });
});

describe('getClearRate', () => {
  it('computes overall clear rate', () => {
    recordGamePlayed('normal');
    recordGamePlayed('normal');
    recordGameCleared('normal', { moves: 10, seconds: 60 });
    const stats = loadStats();
    assert.equal(getClearRate(stats), 50);
  });
});

describe('getModeClearRate', () => {
  it('returns null when no games were played', () => {
    assert.equal(getModeClearRate(0, 0), null);
    assert.equal(getModeClearRate(4, 1), 25);
  });
});

describe('getVegasModeStats', () => {
  it('combines vegas and cumulative mode stats', () => {
    recordGamePlayed('vegas');
    recordGamePlayed('cumulative');
    recordGameCleared('vegas', { moves: 40, seconds: 200 });
    recordGameCleared('cumulative', { moves: 30, seconds: 150 });
    const stats = loadStats();
    const combined = getVegasModeStats(stats);
    assert.equal(combined.played, 2);
    assert.equal(combined.cleared, 2);
    assert.equal(combined.totalClearMoves, 70);
    assert.equal(combined.totalClearSeconds, 350);
  });
});
