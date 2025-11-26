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
  const [roomCode, setRoomCodeState] = useState<string | null>(() => {
    // Load room code from sessionStorage on init
    return sessionStorage.getItem('thunderstack_room_code');
  });
  const [room, setRoom] = useState<Room | null>(null);

  // Persist room code to sessionStorage whenever it changes
  const setRoomCode = (code: string | null) => {
    setRoomCodeState(code);
    if (code) {
      sessionStorage.setItem('thunderstack_room_code', code);
    } else {
      sessionStorage.removeItem('thunderstack_room_code');
    }
  };

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
