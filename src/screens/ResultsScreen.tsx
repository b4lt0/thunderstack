import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const { room } = useRoom();

  if (!room) {
    navigate('/');
    return null;
  }

  const won = room.state === 'WIN';
  const totalCards = 98; // Cards 2-99
  const cardsPlayed = totalCards - room.drawPile.length - Object.values(room.hands).flat().length;

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className={`text-8xl mb-6`}>
          {won ? '🎉' : '💥'}
        </div>
        
        <h1 className={`text-5xl font-bold mb-4 ${won ? 'text-accent' : 'text-red-400'}`}>
          {won ? 'VICTORY!' : 'DEFEATED'}
        </h1>

        <p className="text-slate-300 text-xl mb-8">
          {won 
            ? 'You conquered the stack!' 
            : `The stack wins. ${totalCards - cardsPlayed} cards remain.`}
        </p>

        <div className="bg-card-bg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm">Cards Played</p>
              <p className="text-white text-3xl font-bold">{cardsPlayed}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Turns Taken</p>
              <p className="text-white text-3xl font-bold">{room.turnNumber}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-accent text-dark-bg font-bold py-4 rounded-lg hover:bg-cyan-400 transition-colors text-lg mb-3"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
