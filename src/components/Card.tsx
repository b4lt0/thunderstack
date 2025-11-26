interface CardProps {
    value: number;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    size?: 'small' | 'normal';
  }
  
  export default function Card({ value, onClick, selected, disabled, size = 'normal' }: CardProps) {
    const sizeClasses = size === 'small' 
      ? 'w-14 h-20 text-lg' 
      : 'w-20 h-28 text-2xl min-w-[5rem]';
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${sizeClasses}
          rounded-xl font-bold transition-all duration-200
          flex items-center justify-center
          touch-manipulation
          ${selected 
            ? 'bg-accent text-dark-bg transform -translate-y-3 shadow-xl scale-105 ring-2 ring-accent ring-offset-2 ring-offset-dark-bg' 
            : 'bg-gradient-to-br from-card-bg to-slate-700 text-white hover:from-slate-600 hover:to-slate-600'
          }
          ${disabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'cursor-pointer active:scale-95 hover:shadow-lg'
          }
          shadow-md
        `}
      >
        {value}
      </button>
    );
  }
  