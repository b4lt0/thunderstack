import { createNewGameRoom, canPlayCardOnPile, applyMove } from './logic';
import type { Player, Pile } from './types';

// Quick manual test
const testPlayers: Record<string, Player> = {
  'player1': { id: 'player1', nickname: 'Alice', seatIndex: 0 },
  'player2': { id: 'player2', nickname: 'Bob', seatIndex: 1 },
};

const room = createNewGameRoom('test-room', testPlayers, 'player1');

console.log('Room created:', {
  players: Object.keys(room.players).length,
  drawPileSize: room.drawPile.length,
  player1Hand: room.hands['player1'].length,
  player2Hand: room.hands['player2'].length,
});

// Test pile logic
const ascPile: Pile = { id: 'test', type: 'ASC', topValue: 50 };
console.log('Can play 51 on ASC(50)?', canPlayCardOnPile(ascPile, 51)); // true
console.log('Can play 40 on ASC(50)?', canPlayCardOnPile(ascPile, 40)); // true (10 lower)
console.log('Can play 39 on ASC(50)?', canPlayCardOnPile(ascPile, 39)); // false
