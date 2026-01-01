import React from 'react';

interface ChipProps {
  value: number;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ value, color, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-dashed border-white/40 
        shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform hover:-translate-y-2 transition-all 
        flex items-center justify-center font-bold text-white text-xs md:text-sm font-display
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      `}
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
      ${value}
    </button>
  );
};

export default Chip;