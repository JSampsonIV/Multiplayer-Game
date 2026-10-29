import React from 'react';
import { PlayerPublicState } from '../types';
import { PlayingCard } from './PlayingCard';
import { ModifierCard } from './ModifierCard';
import { ModifierMeter } from './ModifierMeter';
import { Bot, User, CheckCircle2, Layers, Zap } from 'lucide-react';

interface OpponentHandProps {
  opponent: PlayerPublicState | null;
}

export const OpponentHand: React.FC<OpponentHandProps> = ({ opponent }) => {
  if (!opponent) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-cinzel">
        Waiting for opponent to connect...
      </div>
    );
  }

  // Generate array for visual card backs (capped at 6 to avoid clutter)
  const displayCardCount = Math.min(opponent.handCount, 6);
  const displayModifierCount = Math.min(opponent.modifierCount, 4);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-2 px-4 pt-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2">
        {/* Opponent Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            {opponent.isBot ? <Bot className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-cyan-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-sm text-slate-200">
                {opponent.name}
              </span>
              {opponent.isBot && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  AI
                </span>
              )}
              {opponent.hasConfirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono-code">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" /> {opponent.handCount} Normal Cards
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" /> {opponent.modifierCount} Modifiers
              </span>
            </div>
          </div>
        </div>

        {/* Opponent Modifier Meter */}
        <div className="w-full sm:w-auto">
          <ModifierMeter meter={opponent.modifierMeter} isCompact />
        </div>
      </div>

      {/* Opponent Card Backs Display */}
      <div className="flex items-center justify-between px-2">
        {/* Modifiers (face down) */}
        <div className="flex items-center -space-x-12 overflow-visible">
          {Array.from({ length: displayModifierCount }).map((_, idx) => (
            <ModifierCard key={`opp-mod-${idx}`} card={null} isFaceDown size="sm" />
          ))}
          {opponent.modifierCount > 4 && (
            <div className="z-10 ml-1 px-2 py-1 bg-slate-900 border border-purple-500/40 rounded-md text-[10px] text-purple-300 font-mono-code font-bold">
              +{opponent.modifierCount - 4}
            </div>
          )}
        </div>

        {/* Normal Cards (face down) */}
        <div className="flex items-center -space-x-14 overflow-visible">
          {Array.from({ length: displayCardCount }).map((_, idx) => (
            <PlayingCard key={`opp-card-${idx}`} card={null} isFaceDown size="sm" />
          ))}
          {opponent.handCount > 6 && (
            <div className="z-10 ml-1 px-2 py-1 bg-slate-900 border border-amber-500/40 rounded-md text-[10px] text-amber-300 font-mono-code font-bold">
              +{opponent.handCount - 6}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
