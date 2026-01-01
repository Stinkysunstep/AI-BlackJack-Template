import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ICard, Suit } from '../types';

gsap.registerPlugin(Flip);

interface Props {
  card: ICard;
  index: number;
}

const PlayingCard: React.FC<Props> = ({ card, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Animate on mount (Deal)
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // The hidden "Shoe" element ID defined in App.tsx
    const shoeEl = document.getElementById('shoe-source'); 
    
    if (shoeEl) {
        // Initial state
        gsap.set(el, { 
            x: shoeEl.getBoundingClientRect().left - el.getBoundingClientRect().left,
            y: shoeEl.getBoundingClientRect().top - el.getBoundingClientRect().top,
            rotation: Math.random() * 180,
            scale: 0.5,
            opacity: 0
        });

        // Animate to position
        gsap.to(el, {
            x: 0,
            y: 0,
            rotation: (Math.random() * 6 - 3), // Subtle random rotation for realism
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            delay: index * 0.1 // Stagger slightly if dealing multiple at once
        });
    }
  }, []);

  // Animate Flip
  useLayoutEffect(() => {
      const el = cardRef.current;
      if (!el) return;

      if (!card.isHidden) {
          gsap.to(el, {
              rotationY: 0,
              duration: 0.4,
              ease: "power2.inOut"
          });
      } else {
          gsap.set(el, { rotationY: 180 });
      }
  }, [card.isHidden]);

  const isRed = card.suit === Suit.Hearts || card.suit === Suit.Diamonds;

  // 3D Card CSS
  const cardBaseClasses = "w-20 h-28 md:w-24 md:h-36 rounded-lg shadow-xl relative transition-transform transform preserve-3d";
  
  return (
    <div 
        ref={cardRef} 
        className={`${cardBaseClasses} select-none`}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* Front Face */}
      <div 
        className={`absolute inset-0 w-full h-full bg-white rounded-lg backface-hidden flex flex-col justify-between p-2 border border-gray-200 ${card.isHidden ? 'hidden-face' : ''}`}
        style={{ 
            backfaceVisibility: 'hidden',
            transform: card.isHidden ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.4s'
        }}
      >
        <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-gray-900'} leading-none`}>
          {card.rank}
          <div className="text-sm">{card.suit}</div>
        </div>
        
        <div className={`absolute inset-0 flex items-center justify-center text-4xl ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          {card.suit}
        </div>

        <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-gray-900'} leading-none self-end rotate-180`}>
          {card.rank}
          <div className="text-sm">{card.suit}</div>
        </div>
      </div>

      {/* Back Face */}
      <div 
        className="absolute inset-0 w-full h-full rounded-lg backface-hidden border-2 border-white/10"
        style={{ 
            backfaceVisibility: 'hidden',
            transform: card.isHidden ? 'rotateY(0deg)' : 'rotateY(180deg)',
            transition: 'transform 0.4s',
            background: 'repeating-linear-gradient(45deg, #1e3a8a 0px, #1e3a8a 10px, #172554 10px, #172554 20px)'
        }}
      >
          <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-yellow-500/50 flex items-center justify-center">
                  <span className="text-yellow-500/50 font-display text-xs">ROYALE</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PlayingCard;