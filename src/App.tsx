import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { initializeAuth, auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First, sign in anonymously
    initializeAuth()
      .then(() => {
        console.log('Initial auth completed');
      })
      .catch(error => {
        console.error('Auth initialization failed:', error);
        setError(error.message || 'Authentication failed');
      });

    // Then, wait for auth state to be confirmed
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state ready, user:', user.uid);
        setAuthReady(true);
        setError(null);
      } else {
        console.log('No user yet');
      }
    });

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Connection Failed</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent text-dark-bg font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-slate-400">Connecting...</p>
        </div>
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
