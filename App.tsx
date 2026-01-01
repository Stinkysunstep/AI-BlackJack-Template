import React, { useEffect, useState } from 'react';
import { gameInstance } from './logic/Game';
import { GamePhase, ParticipantType } from './types';
import Seat from './components/Seat';
import Controls from './components/Controls';
import Chip from './components/Chips';

const App: React.FC = () => {
  // We use a simplified state wrapper to force re-renders when the game instance updates
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to game updates
    const unsubscribe = gameInstance.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const participants = gameInstance.participants.map((p, idx) => ({
      ...p.toState(idx === gameInstance.turnIndex)
  }));

  const dealer = participants.find(p => p.type === ParticipantType.Dealer)!;
  const player = participants.find(p => p.type === ParticipantType.Player)!;
  const ai1 = participants.find(p => p.name.includes('Sophia'))!;
  const ai2 = participants.find(p => p.name.includes('Marcus'))!;

  const isPlayerTurn = gameInstance.turnIndex === 1 && gameInstance.phase === GamePhase.Playing;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#022c22_60%,_#000000_100%)] text-white overflow-hidden relative selection:bg-emerald-500/30">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30 pointer-events-none">
        <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 drop-shadow-md">
                ROYALE BLACKJACK
            </h1>
            <p className="text-xs text-white/40 tracking-[0.2em] uppercase mt-1">High Stakes Lounge</p>
        </div>
        <div className="text-right pointer-events-auto">
            <button className="text-xs text-white/30 hover:text-white transition-colors" onClick={() => window.location.reload()}>
                RESET TABLE
            </button>
        </div>
      </div>

      {/* The Shoe (Source of cards for animation) - positioned off-screen top right-ish */}
      <div id="shoe-source" className="absolute top-10 right-20 w-2 h-2 bg-transparent pointer-events-none" />

      {/* Main Table Area */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center pt-20 pb-32">
        
        {/* Dealer Area */}
        <div className="mb-10 w-full flex justify-center">
            <Seat participant={dealer} isActive={gameInstance.turnIndex === 3} />
        </div>

        {/* Players Semi-Circle */}
        <div className="w-full max-w-6xl grid grid-cols-3 gap-4 md:gap-12 items-end px-4">
            <div className="flex justify-center pb-12">
                <Seat participant={ai1} isActive={gameInstance.turnIndex === 0} />
            </div>
            
            <div className="flex justify-center -mb-8">
                <Seat participant={player} isActive={gameInstance.turnIndex === 1} />
            </div>

            <div className="flex justify-center pb-12">
                <Seat participant={ai2} isActive={gameInstance.turnIndex === 2} />
            </div>
        </div>

        {/* Action Bar (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-4 z-40">
            <div className="max-w-2xl mx-auto">
                
                {/* Betting Controls */}
                {gameInstance.phase === GamePhase.Betting && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <div className="text-sm uppercase tracking-widest text-emerald-400 mb-4 animate-pulse">Place your bets</div>
                        <div className="flex gap-4 justify-center mb-6">
                            <Chip value={50} color="#ef4444" onClick={() => gameInstance.placeBet(50)} disabled={player.money < 50} />
                            <Chip value={100} color="#3b82f6" onClick={() => gameInstance.placeBet(100)} disabled={player.money < 100} />
                            <Chip value={500} color="#10b981" onClick={() => gameInstance.placeBet(500)} disabled={player.money < 500} />
                            <Chip value={1000} color="#000000" onClick={() => gameInstance.placeBet(1000)} disabled={player.money < 1000} />
                        </div>
                        <div className="flex gap-4">
                             <button 
                                onClick={() => gameInstance.clearBet()}
                                disabled={player.currentBet === 0}
                                className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 text-sm transition-all disabled:opacity-30"
                             >
                                Clear
                             </button>
                             <button 
                                onClick={() => gameInstance.startRound()}
                                disabled={player.currentBet === 0}
                                className="px-8 py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                DEAL CARDS
                             </button>
                        </div>
                    </div>
                )}

                {/* Playing Controls */}
                {gameInstance.phase === GamePhase.Playing && (
                    <div className={`transition-opacity duration-300 ${isPlayerTurn ? 'opacity-100 pointer-events-auto' : 'opacity-30 pointer-events-none'}`}>
                        <Controls 
                            onHit={() => gameInstance.playerHit()}
                            onStand={() => gameInstance.playerStand()}
                            onDouble={() => gameInstance.playerDouble()}
                            canDouble={player.hand.length === 2 && player.money >= player.currentBet}
                            disabled={!isPlayerTurn}
                        />
                         {!isPlayerTurn && (
                            <div className="text-center text-xs text-white/50 mt-2">Waiting for other players...</div>
                        )}
                    </div>
                )}
                
                {/* Result Message (Overlay-ish) */}
                {gameInstance.phase === GamePhase.Resolving && (
                     <div className="text-center animate-bounce mt-4">
                        <span className="text-lg font-display text-white/80">Round Over. Preparing next hand...</span>
                     </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default App;