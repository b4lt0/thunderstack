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

  const handleCardClick = (cardValue: number) => {
    if (!isMyTurn) return;
    setSelectedCard(cardValue === selectedCard ? null : cardValue);
    setError('');
  };

  const handlePileClick = async (pileId: string) => {
    if (!isMyTurn || selectedCard === null) return;

    const pile = room.piles.find(p => p.id === pileId);
    if (!pile) return;

    // Check if move is valid
    if (!canPlayCardOnPile(pile, selectedCard)) {
      setError('Invalid move!');
      return;
    }

    try {
      // Apply move
      const updatedRoom = applyMove(room, currentPlayerId, selectedCard, pileId);
      
      // Check game end
      const gameStatus = checkGameEnd(updatedRoom);
      if (gameStatus !== 'RUNNING') {
        updatedRoom.state = gameStatus;
      }

      await updateRoom(roomCode, updatedRoom);
      setSelectedCard(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Move failed');
    }
  };

  const handleEndTurn = async () => {
    if (!isMyTurn) return;

    try {
      const updatedRoom = endTurn(room, currentPlayerId);
      
      // Check game end
      const gameStatus = checkGameEnd(updatedRoom);
      if (gameStatus !== 'RUNNING') {
        updatedRoom.state = gameStatus;
      }

      await updateRoom(roomCode, updatedRoom);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end turn');
    }
  };

  const currentPlayer = room.players[room.activePlayerId];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-accent mb-2">THUNDERSTACK</h1>
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-slate-400">Deck: {room.drawPile.length}</span>
          <span className="text-slate-400">Turn: {room.turnNumber}</span>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="text-center mb-4">
        {isMyTurn ? (
          <div className="bg-accent bg-opacity-20 border-2 border-accent rounded-lg px-4 py-2 inline-block">
            <p className="text-accent font-bold">YOUR TURN</p>
            <p className="text-xs text-slate-300">
              Play at least {minCardsRequired} card{minCardsRequired > 1 ? 's' : ''} ({cardsPlayedSoFar}/{minCardsRequired})
            </p>
          </div>
        ) : (
          <div className="bg-card-bg rounded-lg px-4 py-2 inline-block">
            <p className="text-slate-400">
              Waiting for <span className="text-white font-bold">{currentPlayer?.nickname}</span>
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Piles - 2x2 grid */}
      <div className="flex-1 flex items-center justify-center mb-6">
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
      <div className="bg-card-bg rounded-t-2xl p-4 shadow-2xl">
        <p className="text-slate-400 text-sm mb-3 text-center">Your Hand ({myHand.length})</p>
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
          {myHand.sort((a, b) => a - b).map((card, index) => (
            <Card
              key={`${card}-${index}`}
              value={card}
              onClick={() => handleCardClick(card)}
              selected={selectedCard === card}
              disabled={!isMyTurn}
            />
          ))}
        </div>

        {/* End turn button */}
        {isMyTurn && (
          <button
            onClick={handleEndTurn}
            disabled={cardsPlayedSoFar < minCardsRequired}
            className="w-full mt-4 bg-accent text-dark-bg font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            End Turn
          </button>
        )}
      </div>
    </div>
  );
}
