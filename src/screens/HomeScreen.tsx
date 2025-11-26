import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../firebase/database';
import { useRoom } from '../context/RoomContext';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { setRoomCode } = useRoom();
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomCode = await createRoom(nickname.trim());
      setRoomCode(roomCode);
      navigate('/lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(joinCode.trim().toUpperCase(), nickname.trim());
      setRoomCode(joinCode.trim().toUpperCase());
      navigate('/lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (    
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">      
      <div className="w-full max-w-md"></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-accent mb-2">THUNDERSTACK</h1>
          <p className="text-slate-400">All of you against the stack</p>
        </div>

        <div className="bg-card-bg rounded-lg p-6 shadow-xl">
          <input
            type="text"
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-accent border border-slate-700"
            maxLength={20}
            autoComplete="off"
          />

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-accent text-dark-bg font-bold py-3 rounded-lg mb-4 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <input
            type="text"
            placeholder="Room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-dark-bg text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-accent border border-slate-700 uppercase"
            maxLength={6}
            autoComplete="off"
          />

          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className="w-full bg-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>

          {error && (
            <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
