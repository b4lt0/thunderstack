import type { Pile as PileType } from '../game/types';

interface PileProps {
  pile: PileType;
  onClick?: () => void;
  canPlay?: boolean;
}

export default function Pile({ pile, onClick, canPlay }: PileProps) {
  const isAscending = pile.type === 'ASC';

  return (
    <button
      onClick={onClick}
      disabled={!canPlay}
      className={`
        w-28 h-36 rounded-xl font-bold text-4xl
        flex flex-col items-center justify-center
        transition-all duration-200
        touch-manipulation
        ${canPlay 
          ? 'bg-accent bg-opacity-20 border-4 border-accent cursor-pointer hover:bg-opacity-30 active:scale-95 shadow-lg shadow-accent/50 animate-pulse' 
          : 'bg-gradient-to-br from-card-bg to-slate-700 border-4 border-slate-600'
        }
      `}
    >
      <div className={`text-sm font-normal mb-1 ${canPlay ? 'text-accent' : 'text-slate-500'}`}>
        {isAscending ? '↑ UP' : '↓ DOWN'}
      </div>
      <div className={canPlay ? 'text-white' : 'text-slate-300'}>{pile.topValue}</div>
      <div className={`text-xs mt-1 ${canPlay ? 'text-accent' : 'text-slate-600'}`}>
        {isAscending ? `${pile.topValue + 1}+ or ${pile.topValue - 10}` : `${pile.topValue - 1}- or ${pile.topValue + 10}`}
      </div>
    </button>
  );
}
