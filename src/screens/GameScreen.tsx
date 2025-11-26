import { useRoom } from '../context/RoomContext';

export default function GameScreen() {
  const { room } = useRoom();

  if (!room) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      <h1 className="text-2xl text-accent text-center">Game Screen (Coming in Step 6)</h1>
      <p className="text-white text-center mt-4">Active Player: {room.activePlayerId}</p>
    </div>
  );
}
