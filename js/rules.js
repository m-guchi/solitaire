export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const RED_SUITS = new Set(['hearts', 'diamonds']);

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({ suit, rank: RANKS[i], value: i + 1, faceUp: false });
    }
  }
  return deck;
}

export function shuffle(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cardColor(card) {
  return RED_SUITS.has(card.suit) ? 'red' : 'black';
}

export function canPlaceOnTableau(card, targetCard) {
  if (!targetCard) return card.value === 13;
  if (cardColor(card) === cardColor(targetCard)) return false;
  return card.value === targetCard.value - 1;
}

export function canPlaceOnFoundation(card, foundation, foundationIndex) {
  if (card.suit !== SUITS[foundationIndex]) return false;
  if (!foundation.length) return card.value === 1;
  const top = foundation[foundation.length - 1];
  return card.value === top.value + 1;
}

export function parsePileId(id) {
  if (id === 'stock') return { type: 'stock' };
  if (id === 'waste') return { type: 'waste' };
  if (id.startsWith('foundation-')) return { type: 'foundation', index: Number(id.split('-')[1]) };
  if (id.startsWith('tableau-')) return { type: 'tableau', index: Number(id.split('-')[1]) };
  return null;
}

export function pileIdFromInfo(info) {
  if (info.type === 'stock') return 'stock';
  if (info.type === 'waste') return 'waste';
  if (info.type === 'foundation') return `foundation-${info.index}`;
  if (info.type === 'tableau') return `tableau-${info.index}`;
  return '';
}
