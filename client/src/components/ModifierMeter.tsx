import React from 'react';
import { Zap } from 'lucide-react';

interface ModifierMeterProps {
  meter: number; // 0 to 10
  playerName?: string;
  isCompact?: boolean;
}

export const ModifierMeter: React.FC<ModifierMeterProps> = ({
  meter,
  playerName,
  isCompact = false,
}) => {
  const current = Math.min(10, Math.max(0, meter));
  const percentage = (current / 10) * 100;

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-purple-500/30">
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] font-mono-code font-bold text-amber-300">
          {current}/10
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm border border-purple-500/40 rounded-xl p-3 shadow-lg shadow-purple-950/20">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xs font-cinzel font-bold text-slate-200">
            {playerName ? `${playerName}'s Modifier Charge` : 'Modifier Charge'}
          </span>
        </div>
        <span className="text-xs font-mono-code font-bold text-amber-300">
          {current}/10
        </span>
      </div>

      {/* 10 Segmented Energy Cells */}
      <div className="grid grid-cols-10 gap-1 my-1">
        {Array.from({ length: 10 }).map((_, index) => {
          const isFilled = index < current;
          return (
            <div
              key={index}
              className={`h-3 rounded-sm transition-all duration-300 ${
                isFilled
                  ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm shadow-amber-500/50'
                  : 'bg-slate-800/80 border border-slate-700/60'
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono-code">
        <span>+1 win / +2 loss</span>
        <span className="text-purple-300 font-semibold">10 pts = 1 Modifier</span>
      </div>
    </div>
  );
};
