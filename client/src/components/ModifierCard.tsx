import React from 'react';
import { ModifierCard as ModifierCardType } from '../types';

interface ModifierCardProps {
  card: ModifierCardType | null;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  isCancelled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ModifierCard: React.FC<ModifierCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  isPlayable = false,
  isCancelled = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-36 text-xs p-2',
    md: 'w-36 h-52 text-sm p-3',
  }[size];

  const rarity = card?.rarity || 'common';
  const rarityColors = {
    common: {
      border: 'border-cyan-500/70',
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40',
      glow: 'shadow-cyan-500/20',
      accent: 'text-cyan-400',
    },
    rare: {
      border: 'border-purple-500/80',
      badge: 'bg-purple-950/80 text-purple-300 border-purple-400/40',
      glow: 'shadow-purple-500/25',
      accent: 'text-purple-400',
    },
    epic: {
      border: 'border-amber-500/80',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-400/40',
      glow: 'shadow-amber-500/30',
      accent: 'text-amber-400',
    },
  }[rarity];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`perspective-1000 ${sizeClasses} select-none transition-all duration-300 transform 
        ${isPlayable ? 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl' : ''}
        ${isSelected ? '-translate-y-4 shadow-2xl' : ''}
        ${className}`}
    >
      {/* 3D Rotating Inner Container */}
      <div
        className={`relative w-full h-full duration-700 transition-transform transform-style-3d ${
          isFaceDown ? 'rotate-y-180' : ''
        } ${isSelected ? 'ring-4 ring-purple-400 rounded-xl shadow-purple-500/60' : ''}`}
      >
        {/* FRONT FACE (Shown when isFaceDown === false) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl backface-hidden shadow-xl p-2.5 flex flex-col justify-between overflow-hidden
            bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 ${rarityColors.border} ${rarityColors.glow}
            ${isCancelled ? 'opacity-50 grayscale' : ''}`}
        >
          {card ? (
            <>
              {/* Top Badge */}
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded-full border ${rarityColors.badge}`}>
                  {card.badge}
                </span>
                <span className="text-xs">⚡</span>
              </div>

              {/* Card Title & Desc */}
              <div className="my-auto text-center px-0.5">
                <h4 className="font-cinzel font-bold text-xs sm:text-sm leading-tight text-white tracking-wide">
                  {card.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] leading-snug text-slate-300 mt-1 font-medium">
                  {card.description}
                </p>
              </div>

              {/* Bottom Rarity tag */}
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500 font-bold border-t border-slate-800/80 pt-1">
                <span>MODIFIER</span>
                <span className={rarityColors.accent}>{card.rarity}</span>
              </div>

              {/* Cancelled Nullify Overlay if countered */}
              {isCancelled && (
                <div className="absolute inset-0 rounded-xl bg-red-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 border-2 border-red-500 text-center">
                  <span className="text-xl">🚫</span>
                  <span className="text-red-300 font-bold text-xs uppercase tracking-wider font-cinzel mt-1">CANCELLED</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600 text-xs font-cinzel">
              Modifier
            </div>
          )}
        </div>

        {/* BACK FACE (Shown when isFaceDown === true via rotate-y-180) */}
        <div className="absolute inset-0 w-full h-full rounded-xl backface-hidden rotate-y-180 shadow-2xl border-2 border-purple-500/60 overflow-hidden">
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-2 flex flex-col items-center justify-center border border-purple-600/30">
            <div className="w-full h-full rounded border border-dashed border-purple-400/40 flex flex-col items-center justify-center bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:10px_10px]">
              <div className="w-8 h-8 rounded-full border border-purple-400 flex items-center justify-center bg-purple-950/90 shadow-md">
                <span className="text-purple-300 text-base">⚡</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-purple-300 mt-1.5 font-cinzel">
                MODIFIER
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
