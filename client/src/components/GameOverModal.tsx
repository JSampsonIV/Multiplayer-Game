import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  isWinner: boolean;
  winnerName: string;
  roundCount: number;
  onRematch: () => void;
  onReturnLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isWinner,
  winnerName,
  roundCount,
  onRematch,
  onReturnLobby,
}) => {
  useEffect(() => {
    if (isWinner) {
      soundManager.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      const interval = setInterval(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 1500);
      return () => clearInterval(interval);
    } else {
      soundManager.playWarTie();
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden animate-scale-up">
        {/* Background Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Header */}
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/60 bg-amber-950/40 shadow-xl">
          {isWinner ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          ) : (
            <Skull className="w-10 h-10 text-rose-500" />
          )}
        </div>

        {/* Title */}
        <h2 className="font-cinzel font-black text-2xl sm:text-3xl tracking-wide mb-1 text-white">
          {isWinner ? 'WAR WON!' : 'DEFEATED'}
        </h2>
        <p className="text-sm text-slate-300 font-medium mb-6">
          {isWinner
            ? `Outstanding command! You reduced the enemy's reserves to zero.`
            : `${winnerName} exhausted your forces. Study their modifiers and strike back!`}
        </p>

        {/* Stats card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-6 flex justify-around text-center">
          <div>
            <div className="text-[10px] uppercase font-mono-code text-slate-400 font-semibold">Rounds Clashed</div>
            <div className="text-xl font-bold font-mono-code text-amber-400">{roundCount}</div>
          </div>
          <div className="w-px bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-mono-code text-slate-400 font-semibold">Victor</div>
            <div className="text-xl font-bold font-cinzel text-emerald-400">{winnerName}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRematch}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Rematch
          </button>
          <button
            onClick={onReturnLobby}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-cinzel font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Leave to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
