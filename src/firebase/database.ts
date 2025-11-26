import { ref, set, onValue, off, push, get } from 'firebase/database';
import { database, auth } from './config';
import type { Room, Player } from '../game/types';
import { createNewGameRoom } from '../game/logic';

// Generate a short room code (6 characters)
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new room in Firebase
export async function createRoom(hostNickname: string): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const roomCode = generateRoomCode();
  const roomRef = ref(database, `rooms/${roomCode}`);

  const initialRoom: Partial<Room> = {
    id: roomCode,
    state: 'LOBBY',
    createdAt: Date.now(),
    hostId: userId,
    players: {
      [userId]: {
        id: userId,
        nickname: hostNickname,
        seatIndex: 0,
      },
    },
    piles: [],
    drawPile: [],
    hands: {},
    activePlayerId: '',
    turnNumber: 0,
    cardsPlayedThisTurn: 0,
  };

  await set(roomRef, initialRoom);
  return roomCode;
}

// Join an existing room
export async function joinRoom(
  roomCode: string,
  nickname: string
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val() as Room;

  if (room.state !== 'LOBBY') {
    throw new Error('Game already started');
  }

  if (Object.keys(room.players).length >= 6) {
    throw new Error('Room is full');
  }

  // Assign next seat index
  const existingSeatIndices = Object.values(room.players).map(p => p.seatIndex);
  const seatIndex = Math.max(...existingSeatIndices, -1) + 1;

  const newPlayer: Player = {
    id: userId,
    nickname,
    seatIndex,
  };

  await set(ref(database, `rooms/${roomCode}/players/${userId}`), newPlayer);
}

// Start the game (host only)
export async function startGame(roomCode: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val() as Room;

  if (room.hostId !== userId) {
    throw new Error('Only host can start the game');
  }

  if (Object.keys(room.players).length < 1) {
    throw new Error('Need at least 1 player');
  }

  // Initialize the game
  const gameRoom = createNewGameRoom(roomCode, room.players, room.hostId);
  await set(roomRef, gameRoom);
}

// Subscribe to room updates
export function subscribeToRoom(
  roomCode: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = ref(database, `rooms/${roomCode}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Room);
    } else {
      callback(null);
    }
  });

  // Return cleanup function
  return () => off(roomRef, 'value', unsubscribe);
}

// Update room state (for game moves)
export async function updateRoom(roomCode: string, updates: Partial<Room>): Promise<void> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const currentRoom = snapshot.val() as Room;
  const updatedRoom = { ...currentRoom, ...updates };

  await set(roomRef, updatedRoom);
}

// Play a card (combines validation + update)
export async function playCard(
  roomCode: string,
  cardValue: number,
  pileId: string
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val() as Room;

  // This will be implemented with actual game logic in components
  // For now, just a placeholder structure
  await set(roomRef, room);
}
