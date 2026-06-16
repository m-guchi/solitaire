import { createDeck, shuffle, canPlaceOnTableau, canPlaceOnFoundation } from './rules.js';

export const MIN_FOUNDATION_MOVES = 5;
export const CUMULATIVE_TRIAL_COUNT = 3;
const MAX_SEARCH_ATTEMPTS = 500;

function cloneCard(card) {
  return { ...card };
}

function cloneLayout(layout) {
  return {
    stock: layout.stock.map(cloneCard),
    waste: layout.waste.map(cloneCard),
    foundations: layout.foundations.map((pile) => pile.map(cloneCard)),
    tableau: layout.tableau.map((pile) => pile.map(cloneCard)),
  };
}

export function buildLayoutFromDeck(deck) {
  const cards = deck.map(cloneCard);
  const tableau = [[], [], [], [], [], [], []];
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = cards.pop();
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }
  return {
    stock: cards.map((c) => ({ ...c, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
}

function getPile(state, pileInfo) {
  switch (pileInfo.type) {
    case 'stock': return state.stock;
    case 'waste': return state.waste;
    case 'foundation': return state.foundations[pileInfo.index];
    case 'tableau': return state.tableau[pileInfo.index];
    default: return [];
  }
}

function getMovableStack(state, pileInfo, cardIndex) {
  const pile = getPile(state, pileInfo);
  if (!pile.length) return null;

  if (pileInfo.type === 'waste') {
    if (cardIndex !== pile.length - 1) return null;
    return [pile[pile.length - 1]];
  }

  if (pileInfo.type === 'foundation') {
    if (cardIndex !== pile.length - 1) return null;
    return [pile[pile.length - 1]];
  }

  if (pileInfo.type === 'tableau') {
    const card = pile[cardIndex];
    if (!card?.faceUp) return null;
    const stack = pile.slice(cardIndex);
    for (let i = 1; i < stack.length; i++) {
      const prev = stack[i - 1];
      const curr = stack[i];
      if (!canPlaceOnTableau(curr, prev)) return null;
    }
    return stack;
  }

  return null;
}

function canMove(state, stack, destInfo) {
  if (!stack?.length) return false;
  const card = stack[0];
  const dest = getPile(state, destInfo);

  if (destInfo.type === 'foundation') {
    if (stack.length > 1) return false;
    return canPlaceOnFoundation(card, dest, destInfo.index);
  }

  if (destInfo.type === 'tableau') {
    const top = dest[dest.length - 1] ?? null;
    return canPlaceOnTableau(card, top);
  }

  return false;
}

function moveCards(state, fromInfo, cardIndex, toInfo) {
  const stack = getMovableStack(state, fromInfo, cardIndex);
  if (!stack || !canMove(state, stack, toInfo)) return false;

  const from = getPile(state, fromInfo);
  const to = getPile(state, toInfo);
  from.splice(cardIndex, stack.length);
  to.push(...stack);

  if (fromInfo.type === 'tableau' && from.length) {
    const last = from[from.length - 1];
    if (!last.faceUp) last.faceUp = true;
  }

  return true;
}

function drawFromStock(state, vegasMode) {
  if (state.stock.length === 0) {
    if (state.waste.length === 0) return false;
    if (vegasMode) return false;
    state.stock = state.waste.reverse().map((c) => ({ ...c, faceUp: false }));
    state.waste = [];
    return true;
  }

  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);
  return true;
}

function scoreTableauMove(state, fromInfo, cardIndex, destInfo) {
  let score = 0;
  const stack = getMovableStack(state, fromInfo, cardIndex);
  const destPile = getPile(state, destInfo);
  if (!stack) return score;

  if (!destPile.length && stack[0].value === 13) score += 100;
  if (fromInfo.type === 'waste') score += 30;
  if (fromInfo.type === 'tableau') {
    const fromPile = getPile(state, fromInfo);
    const below = fromPile[cardIndex - 1];
    if (below && !below.faceUp) score += 80;
  }

  return score - destInfo.index;
}

function tryFoundationMove(state) {
  if (state.waste.length) {
    const from = { type: 'waste' };
    const index = state.waste.length - 1;
    const stack = getMovableStack(state, from, index);
    if (stack?.length === 1) {
      for (let i = 0; i < 4; i++) {
        const dest = { type: 'foundation', index: i };
        if (canMove(state, stack, dest) && moveCards(state, from, index, dest)) {
          return true;
        }
      }
    }
  }

  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col];
    if (!pile.length) continue;
    const index = pile.length - 1;
    const from = { type: 'tableau', index: col };
    const stack = getMovableStack(state, from, index);
    if (stack?.length !== 1) continue;
    for (let i = 0; i < 4; i++) {
      const dest = { type: 'foundation', index: i };
      if (canMove(state, stack, dest) && moveCards(state, from, index, dest)) {
        return true;
      }
    }
  }

  return false;
}

function tryTableauMove(state) {
  let best = null;
  let bestScore = -Infinity;

  const trySource = (fromInfo, index) => {
    const stack = getMovableStack(state, fromInfo, index);
    if (!stack) return;
    for (let col = 0; col < 7; col++) {
      if (fromInfo.type === 'tableau' && fromInfo.index === col) continue;
      const dest = { type: 'tableau', index: col };
      if (!canMove(state, stack, dest)) continue;
      const score = scoreTableauMove(state, fromInfo, index, dest);
      if (score > bestScore) {
        bestScore = score;
        best = { from: fromInfo, index, dest };
      }
    }
  };

  if (state.waste.length) {
    trySource({ type: 'waste' }, state.waste.length - 1);
  }

  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col];
    const from = { type: 'tableau', index: col };
    for (let index = pile.length - 1; index >= 0; index--) {
      if (!pile[index].faceUp) break;
      trySource(from, index);
    }
  }

  if (!best) return false;
  return moveCards(state, best.from, best.index, best.dest);
}

export function countFoundationMoves(layout, vegasMode = false) {
  const state = cloneLayout(layout);
  let foundationMoves = 0;
  let stagnantRounds = 0;
  let stockPassesWithoutProgress = 0;
  let sawStockRefill = false;
  const maxSteps = 3000;
  let steps = 0;

  while (stagnantRounds < 2 && steps < maxSteps) {
    let progressed = false;

    while (tryFoundationMove(state)) {
      foundationMoves++;
      progressed = true;
      steps++;
      stockPassesWithoutProgress = 0;
    }

    if (tryTableauMove(state)) {
      progressed = true;
      stagnantRounds = 0;
      stockPassesWithoutProgress = 0;
      steps++;
      continue;
    }

    const stockBefore = state.stock.length;
    const wasteBefore = state.waste.length;
    if (drawFromStock(state, vegasMode)) {
      progressed = true;
      stagnantRounds = 0;
      steps++;
      if (!vegasMode && stockBefore === 0 && wasteBefore > 0) {
        sawStockRefill = true;
      }
      if (sawStockRefill && state.stock.length === 0 && state.waste.length === 0) {
        stockPassesWithoutProgress++;
        sawStockRefill = false;
        if (stockPassesWithoutProgress >= 1) break;
      }
      continue;
    }

    if (!progressed) stagnantRounds++;
    else stagnantRounds = 0;
  }

  return foundationMoves;
}

function evaluateShuffledDeal(vegasMode) {
  const deck = shuffle(createDeck());
  const layout = buildLayoutFromDeck(deck);
  const moves = countFoundationMoves(layout, vegasMode);
  return { layout, moves };
}

export function selectDealLayout({ vegasMode = false, cumulativeVegas = false, storedVegasScore = 0 } = {}) {
  const cumulativeNegative = cumulativeVegas && storedVegasScore < 0;

  if (cumulativeNegative) {
    const candidates = [];
    let attempts = 0;
    let bestFallback = null;

    while (attempts < MAX_SEARCH_ATTEMPTS && candidates.length < CUMULATIVE_TRIAL_COUNT) {
      attempts++;
      const candidate = evaluateShuffledDeal(vegasMode);
      if (!bestFallback || candidate.moves > bestFallback.moves) {
        bestFallback = candidate;
      }
      if (candidate.moves >= MIN_FOUNDATION_MOVES) {
        candidates.push(candidate);
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.moves - a.moves);
      return candidates[0].layout;
    }

    return bestFallback?.layout ?? evaluateShuffledDeal(vegasMode).layout;
  }

  let bestFallback = null;
  for (let attempts = 0; attempts < MAX_SEARCH_ATTEMPTS; attempts++) {
    const candidate = evaluateShuffledDeal(vegasMode);
    if (!bestFallback || candidate.moves > bestFallback.moves) {
      bestFallback = candidate;
    }
    if (candidate.moves >= MIN_FOUNDATION_MOVES) {
      return candidate.layout;
    }
  }

  return bestFallback?.layout ?? evaluateShuffledDeal(vegasMode).layout;
}
