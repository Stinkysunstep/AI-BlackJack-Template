import React from 'react';
import { IParticipantState, ParticipantType, Result } from '../types';
import PlayingCard from './PlayingCard';
import { User, Cpu, ShieldAlert } from 'lucide-react';

interface Props {
  participant: IParticipantState;
  isActive: boolean;
}

const Seat: React.FC<Props> = ({ participant, isActive }) => {
  const isDealer = participant.type === ParticipantType.Dealer;
  const isPlayer = participant.type === ParticipantType.Player;

  // Outcome color coding
  let borderColor = "border-white/10";
  let glow = "";
  
  if (isActive) {
      borderColor = "border-yellow-400";
      glow = "shadow-[0_0_20px_rgba(250,204,21,0.3)]";
  } else if (participant.result === Result.Win || participant.result === Result.Blackjack) {
      borderColor = "border-emerald-500";
      glow = "shadow-[0_0_20px_rgba(16,185,129,0.3)]";
  } else if (participant.result === Result.Loss) {
      borderColor = "border-red-500";
      glow = "shadow-[0_0_20px_rgba(239,68,68,0.2)]";
  }

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isPlayer ? 'scale-110 -translate-y-8 z-20' : 'scale-90 opacity-90'}`}>
      
      {/* Cards Container */}
      <div className="relative h-32 w-48 md:h-40 md:w-56 mb-4 flex justify-center">
        {participant.hand.map((card, idx) => (
           <div key={card.id} className="absolute" style={{ left: `calc(50% - 40px + ${idx * 25}px)` }}>
               <PlayingCard card={card} index={idx} />
           </div>
        ))}
      </div>

      {/* Info HUD */}
      <div className={`
        relative px-6 py-3 rounded-2xl backdrop-blur-md bg-black/40 border ${borderColor} ${glow}
        flex flex-col items-center min-w-[160px] transition-colors duration-300
      `}>
        {/* Status Badge */}
        {participant.message && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-bounce">
                {participant.message}
            </div>
        )}

        <div className="flex items-center gap-2 mb-1">
            {isDealer ? <ShieldAlert size={14} className="text-gray-400"/> : 
             isPlayer ? <User size={14} className="text-emerald-400"/> : 
             <Cpu size={14} className="text-blue-400"/>}
            <span className={`text-xs font-bold tracking-widest uppercase ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}>
                {participant.name}
            </span>
        </div>
        
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">
                {participant.score}
            </span>
            {isDealer ? null : (
                <span className="text-xs text-emerald-400 font-mono">
                    ${participant.money}
                </span>
            )}
        </div>
        
        {/* Current Bet display (not for dealer) */}
        {!isDealer && participant.currentBet > 0 && (
            <div className="mt-1 text-xs text-yellow-500/80 font-mono">
                Bet: ${participant.currentBet}
            </div>
        )}
      </div>
    </div>
  );
};

export default Seat;