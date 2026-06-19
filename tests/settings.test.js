import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createDealDifficultyControl,
  getDealDifficultyIndexFromRatio,
  getDealDifficultyThumbPercent,
  hasPendingGameModeChange,
  DEAL_DIFFICULTY_OPTIONS,
  getDealDifficultyIndex,
  getDealDifficultyLabel,
  getDealDifficultyValue,
  normalizeDealDifficulty,
} from '../js/settings.js';

describe('deal difficulty slider helpers', () => {
  it('maps values to slider indices and back', () => {
    for (const [index, option] of DEAL_DIFFICULTY_OPTIONS.entries()) {
      assert.equal(getDealDifficultyIndex(option.value), index);
      assert.equal(getDealDifficultyValue(index), option.value);
      assert.equal(getDealDifficultyLabel(option.value), option.label);
    }
  });

  it('normalizes legacy and invalid values', () => {
    assert.equal(normalizeDealDifficulty('random'), 'veryHard');
    assert.equal(getDealDifficultyIndex('random'), 3);
    assert.equal(getDealDifficultyValue(99), 'normal');
  });

  it('aligns thumb positions with tick label centers', () => {
    assert.equal(getDealDifficultyThumbPercent(0), 12.5);
    assert.equal(getDealDifficultyThumbPercent(1), 37.5);
    assert.equal(getDealDifficultyThumbPercent(2), 62.5);
    assert.equal(getDealDifficultyThumbPercent(3), 87.5);
    assert.equal(getDealDifficultyIndexFromRatio(0), 0);
    assert.equal(getDealDifficultyIndexFromRatio(0.24), 0);
    assert.equal(getDealDifficultyIndexFromRatio(0.25), 1);
    assert.equal(getDealDifficultyIndexFromRatio(1), 3);
  });

  it('detects pending game mode changes during an active game', () => {
    const settings = {
      vegasMode: true,
      cumulativeVegas: false,
      dealDifficulty: 'hard',
    };
    const game = {
      vegasMode: false,
      cumulativeVegas: false,
      dealDifficulty: 'normal',
    };
    assert.equal(hasPendingGameModeChange(settings, game, { gameStarted: false }), false);
    assert.equal(hasPendingGameModeChange(settings, game, { gameStarted: true }), true);
    assert.equal(
      hasPendingGameModeChange(
        { ...settings, vegasMode: false, dealDifficulty: 'normal' },
        game,
        { gameStarted: true },
      ),
      false,
    );
  });
});
