export type PileType = 'ASC' | 'DESC';

export type GameState = 'LOBBY' | 'PLAYING' | 'WIN' | 'LOSS';

export interface Pile {
  id: string;
  type: PileType;
  topValue: number;
}

export interface Player {
  id: string;
  nickname: string;
  seatIndex: number;
}

export interface Room {
  id: string;
  state: GameState;
  createdAt: number;
  hostId: string;
  players: Record<string, Player>; // keyed by userId
  piles: Pile[];
  drawPile: number[];
  hands: Record<string, number[]>; // keyed by userId
  activePlayerId: string;
  turnNumber: number;
  cardsPlayedThisTurn: number;
}
