import React from 'react';
import { Card } from '../types';

interface PlayingCardProps {
  card: Card | null;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  joker: '★',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  isPlayable = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-24 text-xs',
    md: 'w-24 h-36 text-sm',
    lg: 'w-32 h-48 text-base',
  }[size];

  if (isFaceDown || !card) {
    return (
      <div
        onClick={isPlayable ? onClick : undefined}
        className={`relative ${sizeClasses} rounded-xl border-2 border-slate-700/80 shadow-2xl transition-all duration-300 transform 
          ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:border-amber-400' : ''}
          ${isSelected ? '-translate-y-3 ring-4 ring-amber-400 shadow-amber-500/40' : ''}
          ${className}`}
      >
        {/* Card Back Ornate Pattern */}
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-1.5 flex items-center justify-center border border-indigo-700/40">
          <div className="w-full h-full rounded-lg border-2 border-dashed border-indigo-500/30 flex flex-col items-center justify-center bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:8px_8px]">
            <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center bg-slate-950/80 shadow-inner">
              <span className="text-amber-400 font-cinzel text-xs font-bold">WAR</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.color === 'red';
  const isJoker = card.suit === 'joker';
  const suitSymbol = SUIT_SYMBOLS[card.suit] || '♠';

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative ${sizeClasses} rounded-xl select-none transition-all duration-300 transform 
        ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:shadow-amber-500/30' : ''}
        ${isSelected ? '-translate-y-4 ring-4 ring-amber-400 shadow-2xl shadow-amber-500/50' : 'shadow-xl'}
        ${isJoker ? 'border-2 border-amber-400/90 bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-slate-900' : 'bg-slate-100 border border-slate-300'}
        ${className}`}
    >
      {isJoker ? (
        // Joker Special Card Styling
        <div className="w-full h-full rounded-xl p-2 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-amber-950 text-amber-300 border border-amber-400/60 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Top Left */}
          <div className="flex flex-col items-start leading-none z-10">
            <span className="font-cinzel font-black tracking-wider text-xs text-amber-400">JOKER</span>
            <span className="text-xs">★</span>
          </div>

          {/* Center Art */}
          <div className="flex flex-col items-center justify-center my-auto z-10">
            <div className="w-12 h-12 rounded-full border border-amber-400/50 flex items-center justify-center bg-purple-900/40 shadow-lg">
              <span className="text-2xl animate-pulse">🃏</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 mt-1">RANK 15</span>
          </div>

          {/* Bottom Right */}
          <div className="flex flex-col items-end leading-none z-10">
            <span className="text-xs">★</span>
            <span className="font-cinzel font-black tracking-wider text-xs text-amber-400">JOKER</span>
          </div>
        </div>
      ) : (
        // Standard Card Face
        <div className="w-full h-full rounded-xl p-2 flex flex-col justify-between relative bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
          {/* Top Left Index */}
          <div className={`flex flex-col items-start leading-none font-bold ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-base font-black font-cinzel">{card.label}</span>
            <span className="text-sm -mt-0.5">{suitSymbol}</span>
          </div>

          {/* Center Symbol */}
          <div className={`flex flex-col items-center justify-center my-auto ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-3xl filter drop-shadow-sm select-none">{suitSymbol}</span>
            <span className="text-[10px] font-mono-code font-bold opacity-60">R{card.rank}</span>
          </div>

          {/* Bottom Right Index */}
          <div className={`flex flex-col items-end leading-none font-bold rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-base font-black font-cinzel">{card.label}</span>
            <span className="text-sm -mt-0.5">{suitSymbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
