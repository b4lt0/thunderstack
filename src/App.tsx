import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { initializeAuth } from './firebase/config';
import { useRoom } from './context/RoomContext';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';

function AppRoutes() {
  const { room } = useRoom();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!room) return;

    // Auto-navigate based on room state
    if (room.state === 'PLAYING' && location.pathname !== '/game') {
      navigate('/game');
    } else if (room.state === 'LOBBY' && location.pathname !== '/lobby') {
      navigate('/lobby');
    } else if ((room.state === 'WIN' || room.state === 'LOSS') && location.pathname !== '/results') {
      navigate('/results');
    }
  }, [room, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/lobby" element={<LobbyScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth()
      .then(user => {
        setUserId(user.uid);
        setLoading(false);
      })
      .catch(error => {
        console.error('Auth initialization failed:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-slate-400">Initializing...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-red-400">Authentication failed</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
