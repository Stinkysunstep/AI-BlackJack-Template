import React from 'react';
import { GamePhase } from '../types';

interface Props {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  canDouble: boolean;
  disabled: boolean;
}

const Button: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' }> = ({ 
    onClick, disabled, children, variant = 'primary' 
}) => {
    let baseStyle = "px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg backdrop-blur-sm";
    
    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30",
        secondary: "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30",
        danger: "bg-red-600 hover:bg-red-500 text-white border border-red-400/30"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

const Controls: React.FC<Props> = ({ onHit, onStand, onDouble, canDouble, disabled }) => {
  return (
    <div className="flex gap-4 items-center justify-center p-4">
      <Button onClick={onHit} disabled={disabled} variant="primary">Hit</Button>
      <Button onClick={onStand} disabled={disabled} variant="danger">Stand</Button>
      <Button onClick={onDouble} disabled={disabled || !canDouble} variant="secondary">Double</Button>
    </div>
  );
};

export default Controls;