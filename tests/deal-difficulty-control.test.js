import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDealDifficultyControl } from '../js/settings.js';

describe('createDealDifficultyControl', () => {
  it('returns null when root is missing', () => {
    assert.equal(createDealDifficultyControl(null), null);
  });
});
