import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildLayoutFromDeck,
  countFoundationMoves,
  selectDealLayout,
  MIN_FOUNDATION_MOVES,
  CUMULATIVE_TRIAL_COUNT,
} from '../js/deal-quality.js';
import { createDeck } from '../js/rules.js';

describe('countFoundationMoves', () => {
  it('counts foundation placements during simulated play', () => {
    const deck = createDeck();
    const layout = buildLayoutFromDeck(deck);
    const moves = countFoundationMoves(layout, true);
    assert.equal(typeof moves, 'number');
    assert.ok(moves >= 0);
  });
});

describe('selectDealLayout', () => {
  it('returns deals with at least the minimum foundation moves when possible', () => {
    const layout = selectDealLayout({ vegasMode: true });
    const moves = countFoundationMoves(layout, true);
    assert.ok(moves >= MIN_FOUNDATION_MOVES);
  });

  it('returns a valid layout when cumulative score is negative', () => {
    const layout = selectDealLayout({
      vegasMode: true,
      cumulativeVegas: true,
      storedVegasScore: -100,
    });
    const moves = countFoundationMoves(layout, true);
    assert.ok(layout.tableau.length === 7);
    assert.ok(layout.stock.length === 24);
    assert.ok(moves >= MIN_FOUNDATION_MOVES);
  });

  it('exports cumulative trial count constant', () => {
    assert.equal(CUMULATIVE_TRIAL_COUNT, 3);
  });
});
