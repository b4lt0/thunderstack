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
        w-24 h-32 rounded-lg font-bold text-3xl
        flex flex-col items-center justify-center
        transition-all
        ${canPlay 
          ? 'bg-accent bg-opacity-20 border-2 border-accent cursor-pointer hover:bg-opacity-30' 
          : 'bg-card-bg border-2 border-slate-700'
        }
      `}
    >
      <div className="text-xs text-slate-400 mb-1">
        {isAscending ? '↑' : '↓'}
      </div>
      <div className="text-white">{pile.topValue}</div>
    </button>
  );
}
