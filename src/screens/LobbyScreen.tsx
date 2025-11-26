import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { startGame } from '../firebase/database';
import { auth } from '../firebase/config';
import { useEffect, useState } from 'react';

export default function LobbyScreen() {
  const navigate = useNavigate();
  const { room, roomCode } = useRoom();
  const [loading, setLoading] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!room || !roomCode) {
      navigate('/');
      return;
    }

    // Navigate to game if it started
    if (room.state === 'PLAYING') {
      navigate('/game');
    }
  }, [room, roomCode, navigate]);

  if (!room || !roomCode) return null;

  const isHost = room.hostId === currentUserId;
  const players = Object.values(room.players).sort((a, b) => a.seatIndex - b.seatIndex);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      await startGame(roomCode);
      // Navigation will happen automatically via useEffect
    } catch (err) {
      console.error('Failed to start game:', err);
      alert(err instanceof Error ? err.message : 'Failed to start game');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">LOBBY</h1>
          <div className="bg-card-bg rounded-lg px-6 py-3 inline-block">
            <p className="text-slate-400 text-sm">Room Code</p>
            <p className="text-3xl font-bold text-white tracking-wider">{roomCode}</p>
          </div>
        </div>

        <div className="bg-card-bg rounded-lg p-6 shadow-xl mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Players ({players.length}/6)
          </h2>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-dark-bg rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <span className="text-white">{player.nickname}</span>
                {player.id === room.hostId && (
                  <span className="text-xs bg-accent text-dark-bg px-2 py-1 rounded font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="w-full bg-accent text-dark-bg font-bold py-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? 'Starting...' : 'Start Game'}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-slate-400">Waiting for host to start...</p>
          </div>
        )}

        <button
          onClick={() => {
            navigate('/');
          }}
          className="w-full mt-4 text-slate-400 hover:text-white transition-colors"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
