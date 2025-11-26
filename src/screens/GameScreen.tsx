import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { getPlayerId, updateRoom } from '../firebase/database';
import { canPlayCardOnPile, applyMove, endTurn, checkGameEnd } from '../game/logic';
import Card from '../components/Card';
import Pile from '../components/Pile';

export default function GameScreen() {
  const navigate = useNavigate();
  const { room, roomCode } = useRoom();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlayerId = getPlayerId();

  useEffect(() => {
    if (!room || !roomCode) {
      navigate('/');
      return;
    }

    if (room.state === 'WIN' || room.state === 'LOSS') {
      navigate('/results');
    }
  }, [room, roomCode, navigate]);

  if (!room || !roomCode) return null;

  const isMyTurn = room.activePlayerId === currentPlayerId;
  const myHand = room.hands[currentPlayerId] || [];
  const minCardsRequired = room.drawPile.length > 0 ? 2 : 1;
  const cardsPlayedSoFar = room.cardsPlayedThisTurn;
  const canEndTurn = cardsPlayedSoFar >= minCardsRequired;

  const handleCardClick = (cardValue: number) => {
    if (!isMyTurn || isProcessing) return;
    setSelectedCard(cardValue === selectedCard ? null : cardValue);
    setError('');
  };

  const handlePileClick = async (pileId: string) => {
    if (!isMyTurn || selectedCard === null || isProcessing) return;

    const pile = room.piles.find(p => p.id === pileId);
    if (!pile) return;

    if (!canPlayCardOnPile(pile, selectedCard)) {
      setError('Invalid move!');
      setTimeout(() => setError(''), 2000);
      return;
    }

    setIsProcessing(true);
    try {
      const updatedRoom = applyMove(room, currentPlayerId, selectedCard, pileId);
      const gameStatus = checkGameEnd(updatedRoom);
      if (gameStatus !== 'RUNNING') {
        updatedRoom.state = gameStatus;
      }

      await updateRoom(roomCode, updatedRoom);
      setSelectedCard(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Move failed');
      setTimeout(() => setError(''), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndTurn = async () => {
    if (!isMyTurn || !canEndTurn || isProcessing) return;

    setIsProcessing(true);
    try {
      const updatedRoom = endTurn(room, currentPlayerId);
      const gameStatus = checkGameEnd(updatedRoom);
      if (gameStatus !== 'RUNNING') {
        updatedRoom.state = gameStatus;
      }

      await updateRoom(roomCode, updatedRoom);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end turn');
      setTimeout(() => setError(''), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlayer = room.players[room.activePlayerId];
  const allPlayers = Object.values(room.players).sort((a, b) => a.seatIndex - b.seatIndex);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <div className="bg-card-bg shadow-lg p-4 safe-area-top">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xl font-bold text-accent">THUNDERSTACK</div>
          <div className="flex gap-3 text-sm">
            <span className="text-slate-400">📚 {room.drawPile.length}</span>
            <span className="text-slate-400">🔄 {room.turnNumber}</span>
          </div>
        </div>

        {/* Other Players */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {allPlayers.map((player) => {
            const isActive = player.id === room.activePlayerId;
            const isMe = player.id === currentPlayerId;
            const handSize = room.hands[player.id]?.length || 0;
            
            return (
              <div
                key={player.id}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-lg text-xs
                  ${isActive ? 'bg-accent text-dark-bg font-bold' : 'bg-slate-700 text-slate-300'}
                  ${isMe ? 'ring-2 ring-white' : ''}
                `}
              >
                <div className="flex items-center gap-1">
                  <span>{player.nickname}</span>
                  {!isMe && <span className="text-xs opacity-75">({handSize})</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn indicator */}
      <div className="px-4 pt-4 pb-2">
        {isMyTurn ? (
          <div className="bg-accent bg-opacity-20 border-2 border-accent rounded-xl px-4 py-3 text-center">
            <p className="text-accent font-bold text-lg">YOUR TURN</p>
            <p className="text-sm text-slate-300 mt-1">
              {selectedCard 
                ? `Card ${selectedCard} selected - tap a pile`
                : `Play ${minCardsRequired} card${minCardsRequired > 1 ? 's' : ''} (${cardsPlayedSoFar}/${minCardsRequired})`
              }
            </p>
          </div>
        ) : (
          <div className="bg-card-bg rounded-xl px-4 py-3 text-center">
            <p className="text-slate-400">
              <span className="text-white font-bold">{currentPlayer?.nickname}</span> is playing...
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg px-4 py-2 text-center">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Piles - 2x2 grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-2 gap-4">
          {room.piles.map((pile) => (
            <Pile
              key={pile.id}
              pile={pile}
              onClick={() => handlePileClick(pile.id)}
              canPlay={isMyTurn && selectedCard !== null && canPlayCardOnPile(pile, selectedCard)}
            />
          ))}
        </div>
      </div>

      {/* My hand */}
      <div className="bg-card-bg rounded-t-3xl shadow-2xl safe-area-bottom">
        <div className="p-4">
          <p className="text-slate-400 text-sm mb-3 text-center font-medium">
            Your Hand ({myHand.length} card{myHand.length !== 1 ? 's' : ''})
          </p>
          
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {myHand.length === 0 ? (
              <p className="text-slate-500 text-sm py-8">No cards in hand</p>
            ) : (
              myHand.sort((a, b) => a - b).map((card, index) => (
                <Card
                  key={`${card}-${index}`}
                  value={card}
                  onClick={() => handleCardClick(card)}
                  selected={selectedCard === card}
                  disabled={!isMyTurn || isProcessing}
                />
              ))
            )}
          </div>

          {/* End turn button */}
          {isMyTurn && (
            <button
              onClick={handleEndTurn}
              disabled={!canEndTurn || isProcessing}
              className="w-full mt-4 bg-accent text-dark-bg font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg active:scale-95 touch-manipulation"
            >
              {isProcessing ? 'Processing...' : canEndTurn ? 'End Turn ✓' : `Play ${minCardsRequired - cardsPlayedSoFar} more`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
