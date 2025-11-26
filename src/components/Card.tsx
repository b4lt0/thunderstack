interface CardProps {
    value: number;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    size?: 'small' | 'normal';
  }
  
  export default function Card({ value, onClick, selected, disabled, size = 'normal' }: CardProps) {
    const sizeClasses = size === 'small' 
      ? 'w-12 h-16 text-lg' 
      : 'w-16 h-24 text-2xl';
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${sizeClasses}
          rounded-lg font-bold transition-all
          ${selected 
            ? 'bg-accent text-dark-bg transform -translate-y-2 shadow-lg' 
            : 'bg-card-bg text-white hover:bg-slate-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:transform hover:-translate-y-1'}
          shadow-md
        `}
      >
        {value}
      </button>
    );
  }
  