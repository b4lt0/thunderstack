import type { Room, Player, Pile } from './types';

// Shuffle array using Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create a new game room
export function createNewGameRoom(
  roomId: string,
  players: Record<string, Player>,
  hostId: string
): Room {
  const playerCount = Object.keys(players).length;
  
  // Determine hand size: 1 player = 8, 2 players = 7, 3+ players = 6
  const handSize = playerCount === 1 ? 8 : playerCount === 2 ? 7 : 6;
  
  // Create deck: cards 2-99
  const allCards = Array.from({ length: 98 }, (_, i) => i + 2);
  const shuffledDeck = shuffle(allCards);
  
  // Deal hands
  const hands: Record<string, number[]> = {};
  const playerIds = Object.keys(players);
  
  let deckIndex = 0;
  playerIds.forEach(playerId => {
    hands[playerId] = shuffledDeck.slice(deckIndex, deckIndex + handSize);
    deckIndex += handSize;
  });
  
  // Remaining cards are the draw pile
  const drawPile = shuffledDeck.slice(deckIndex);
  
  // Initialize 4 piles
  const piles: Pile[] = [
    { id: 'asc1', type: 'ASC', topValue: 1 },
    { id: 'asc2', type: 'ASC', topValue: 1 },
    { id: 'desc1', type: 'DESC', topValue: 100 },
    { id: 'desc2', type: 'DESC', topValue: 100 },
  ];
  
  return {
    id: roomId,
    state: 'PLAYING',
    createdAt: Date.now(),
    hostId,
    players,
    piles,
    drawPile,
    hands,
    activePlayerId: playerIds[0], // First player starts
    turnNumber: 1,
    cardsPlayedThisTurn: 0,
  };
}

// Check if a card can be played on a pile
export function canPlayCardOnPile(
  pile: Pile,
  cardValue: number
): boolean {
  if (pile.type === 'ASC') {
    // Ascending: card must be higher OR exactly 10 lower (backwards jump)
    return cardValue > pile.topValue || cardValue === pile.topValue - 10;
  } else {
    // Descending: card must be lower OR exactly 10 higher (backwards jump)
    return cardValue < pile.topValue || cardValue === pile.topValue + 10;
  }
}

// Apply a move: play a card from hand to pile
export function applyMove(
  room: Room,
  playerId: string,
  cardValue: number,
  pileId: string
): Room {
  // Validate player is active
  if (room.activePlayerId !== playerId) {
    throw new Error('Not your turn');
  }
  
  // Find the pile
  const pile = room.piles.find(p => p.id === pileId);
  if (!pile) {
    throw new Error('Invalid pile');
  }
  
  // Check if move is valid
  if (!canPlayCardOnPile(pile, cardValue)) {
    throw new Error('Invalid move');
  }
  
  // Check player has the card
  const hand = room.hands[playerId];
  const cardIndex = hand.indexOf(cardValue);
  if (cardIndex === -1) {
    throw new Error('Card not in hand');
  }
  
  // Apply the move
  const newHand = hand.filter((_, i) => i !== cardIndex);
  const newPile = { ...pile, topValue: cardValue };
  
  return {
    ...room,
    hands: {
      ...room.hands,
      [playerId]: newHand,
    },
    piles: room.piles.map(p => p.id === pileId ? newPile : p),
    cardsPlayedThisTurn: room.cardsPlayedThisTurn + 1,
  };
}

// End current player's turn
export function endTurn(room: Room, playerId: string): Room {
  if (room.activePlayerId !== playerId) {
    throw new Error('Not your turn');
  }
  
  // Check minimum cards requirement
  const minCards = room.drawPile.length > 0 ? 2 : 1;
  if (room.cardsPlayedThisTurn < minCards) {
    throw new Error(`Must play at least ${minCards} card(s)`);
  }
  
  // Draw cards back to original hand size
  const playerCount = Object.keys(room.players).length;
  const handSize = playerCount === 1 ? 8 : playerCount === 2 ? 7 : 6;
  
  const currentHandSize = room.hands[playerId].length;
  const cardsToDraw = Math.min(
    handSize - currentHandSize,
    room.drawPile.length
  );
  
  const drawnCards = room.drawPile.slice(0, cardsToDraw);
  const newDrawPile = room.drawPile.slice(cardsToDraw);
  const newHand = [...room.hands[playerId], ...drawnCards];
  
  // Move to next player
  const playerIds = Object.keys(room.players).sort((a, b) => 
    room.players[a].seatIndex - room.players[b].seatIndex
  );
  const currentIndex = playerIds.indexOf(playerId);
  const nextPlayerId = playerIds[(currentIndex + 1) % playerIds.length];
  
  return {
    ...room,
    hands: {
      ...room.hands,
      [playerId]: newHand,
    },
    drawPile: newDrawPile,
    activePlayerId: nextPlayerId,
    turnNumber: room.turnNumber + 1,
    cardsPlayedThisTurn: 0,
  };
}

// Check if player can make any valid move
export function canPlayerMove(room: Room, playerId: string): boolean {
  const hand = room.hands[playerId];
  
  for (const card of hand) {
    for (const pile of room.piles) {
      if (canPlayCardOnPile(pile, card)) {
        return true;
      }
    }
  }
  
  return false;
}

// Check game end condition
export function checkGameEnd(room: Room): 'RUNNING' | 'WIN' | 'LOSS' {
  // Win: all cards played (draw pile empty and all hands empty)
  const allHandsEmpty = Object.values(room.hands).every(hand => hand.length === 0);
  if (room.drawPile.length === 0 && allHandsEmpty) {
    return 'WIN';
  }
  
  // Check if active player can meet minimum card requirement
  const minCards = room.drawPile.length > 0 ? 2 : 1;
  const cardsStillNeeded = minCards - room.cardsPlayedThisTurn;
  
  if (cardsStillNeeded <= 0) {
    // Already played enough cards this turn
    return 'RUNNING';
  }
  
  // Loss: active player cannot play enough cards to meet minimum
  const activeHand = room.hands[room.activePlayerId];
  
  // If hand has fewer cards than needed, check if any are playable
  if (activeHand.length < cardsStillNeeded) {
    return 'LOSS';
  }
  
  // Count how many cards in hand can be played
  let playableCount = 0;
  for (const card of activeHand) {
    for (const pile of room.piles) {
      if (canPlayCardOnPile(pile, card)) {
        playableCount++;
        break; // This card is playable, move to next card
      }
    }
    if (playableCount >= cardsStillNeeded) {
      return 'RUNNING'; // Player can still meet requirement
    }
  }
  
  // Player doesn't have enough playable cards to meet minimum
  return 'LOSS';
}

