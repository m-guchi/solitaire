import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildLayoutFromDeck,
  countFoundationMoves,
  selectDealLayout,
  estimateVegasScoreFromFoundationMoves,
  foundationMovesFromVegasScore,
  getDealDifficultyScoreTarget,
  DEAL_DIFFICULTY_SCORE_TARGETS,
  SCORE_BAND_HALF_WIDTH,
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

describe('deal difficulty scoring', () => {
  it('maps vegas score targets to foundation moves', () => {
    assert.equal(estimateVegasScoreFromFoundationMoves(12), 8);
    assert.equal(estimateVegasScoreFromFoundationMoves(10.4), 0);
    assert.equal(estimateVegasScoreFromFoundationMoves(5), -27);
    assert.equal(foundationMovesFromVegasScore(10), 12.4);
    assert.equal(foundationMovesFromVegasScore(0), 10.4);
    assert.equal(foundationMovesFromVegasScore(-25), 5.4);
  });

  it('exposes configured score targets', () => {
    assert.equal(getDealDifficultyScoreTarget('easy'), DEAL_DIFFICULTY_SCORE_TARGETS.easy);
    assert.equal(getDealDifficultyScoreTarget('normal'), 0);
    assert.equal(getDealDifficultyScoreTarget('hard'), -25);
    assert.equal(getDealDifficultyScoreTarget('veryHard'), null);
  });

  it('uses a score band sized for roughly target stdev 8', () => {
    assert.ok(SCORE_BAND_HALF_WIDTH > 13);
    assert.ok(SCORE_BAND_HALF_WIDTH < 15);
  });
});

describe('selectDealLayout', () => {
  it('returns a valid layout for very hard mode', () => {
    const layout = selectDealLayout({ vegasMode: true, dealDifficulty: 'veryHard' });
    assert.ok(layout.tableau.length === 7);
    assert.ok(layout.stock.length === 24);
  });

  it('targets higher estimated scores for easy than hard', () => {
    const easyLayout = selectDealLayout({ vegasMode: true, dealDifficulty: 'easy' });
    const hardLayout = selectDealLayout({ vegasMode: true, dealDifficulty: 'hard' });
    const easyScore = estimateVegasScoreFromFoundationMoves(countFoundationMoves(easyLayout, true));
    const hardScore = estimateVegasScoreFromFoundationMoves(countFoundationMoves(hardLayout, true));
    assert.ok(easyScore > hardScore);
  });

  it('varies hard deals within the score band', () => {
    const scores = new Set();
    for (let i = 0; i < 8; i++) {
      const layout = selectDealLayout({ vegasMode: true, dealDifficulty: 'hard' });
      scores.add(estimateVegasScoreFromFoundationMoves(countFoundationMoves(layout, true)));
    }
    assert.ok(scores.size > 1);
  });
});
