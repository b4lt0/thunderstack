import { useEffect, useState } from 'react';
import { initializeAuth } from './firebase/config';

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

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-accent mb-4">THUNDERSTACK</h1>
        <p className="text-slate-400">All of you against the stack</p>
        {userId && (
          <p className="text-xs text-slate-600 mt-4">User ID: {userId.slice(0, 8)}...</p>
        )}
      </div>
    </div>
  );
}

export default App;
