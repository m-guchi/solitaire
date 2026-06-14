import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SUITS,
  createDeck,
  canPlaceOnTableau,
  canPlaceOnFoundation,
  parsePileId,
  pileIdFromInfo,
} from '../js/rules.js';

describe('createDeck', () => {
  it('creates 52 unique cards', () => {
    const deck = createDeck();
    assert.equal(deck.length, 52);
    const keys = new Set(deck.map((card) => `${card.suit}:${card.rank}`));
    assert.equal(keys.size, 52);
  });
});

describe('canPlaceOnTableau', () => {
  const king = { suit: 'spades', rank: 'K', value: 13 };
  const queenRed = { suit: 'hearts', rank: 'Q', value: 12 };
  const queenBlack = { suit: 'clubs', rank: 'Q', value: 12 };

  it('allows king on empty column', () => {
    assert.equal(canPlaceOnTableau(king, null), true);
  });

  it('rejects non-king on empty column', () => {
    assert.equal(canPlaceOnTableau(queenRed, null), false);
  });

  it('allows alternating colors in descending order', () => {
    assert.equal(canPlaceOnTableau(queenRed, king), true);
    assert.equal(canPlaceOnTableau(queenBlack, king), false);
  });
});

describe('canPlaceOnFoundation', () => {
  const aceHearts = { suit: 'hearts', rank: 'A', value: 1 };
  const twoHearts = { suit: 'hearts', rank: '2', value: 2 };
  const aceSpades = { suit: 'spades', rank: 'A', value: 1 };

  it('allows ace on empty hearts foundation', () => {
    assert.equal(canPlaceOnFoundation(aceHearts, [], 0), true);
  });

  it('rejects wrong suit on foundation', () => {
    assert.equal(canPlaceOnFoundation(aceSpades, [], 0), false);
  });

  it('requires ascending same-suit sequence', () => {
    assert.equal(canPlaceOnFoundation(twoHearts, [aceHearts], 0), true);
    assert.equal(canPlaceOnFoundation(aceHearts, [aceHearts], 0), false);
  });
});

describe('pile ids', () => {
  it('parses and serializes pile identifiers', () => {
    assert.deepEqual(parsePileId('stock'), { type: 'stock' });
    assert.deepEqual(parsePileId('foundation-2'), { type: 'foundation', index: 2 });
    assert.equal(pileIdFromInfo({ type: 'tableau', index: 4 }), 'tableau-4');
    assert.equal(parsePileId('invalid'), null);
  });

  it('covers all foundation suits', () => {
    assert.deepEqual(SUITS.length, 4);
    SUITS.forEach((_, index) => {
      assert.equal(pileIdFromInfo({ type: 'foundation', index }), `foundation-${index}`);
    });
  });
});
