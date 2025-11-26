import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Room } from '../game/types';
import { subscribeToRoom } from '../firebase/database';

interface RoomContextType {
  room: Room | null;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }

    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return unsubscribe;
  }, [roomCode]);

  return (
    <RoomContext.Provider value={{ room, roomCode, setRoomCode }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
}
