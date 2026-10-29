import React, { useState } from 'react';
import { GameLogEntry } from '../types';
import { ScrollText, ChevronDown, ChevronUp, Swords, Zap, AlertCircle, Trophy, Flame } from 'lucide-react';

interface CombatLogProps {
  logs: GameLogEntry[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getLogIcon = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'battle':
        return <Swords className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case 'modifier':
        return <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
      case 'tie':
        return <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
      case 'victory':
        return <Trophy className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'danger':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      default:
        return <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 flex-shrink-0" />;
    }
  };

  const getLogClasses = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'battle':
        return 'text-amber-200 border-amber-900/30 bg-amber-950/20';
      case 'modifier':
        return 'text-purple-200 border-purple-900/30 bg-purple-950/20';
      case 'tie':
        return 'text-red-200 border-red-900/30 bg-red-950/20 font-semibold';
      case 'victory':
        return 'text-emerald-200 border-emerald-900/30 bg-emerald-950/20 font-semibold';
      case 'danger':
        return 'text-rose-200 border-rose-900/30 bg-rose-950/20';
      default:
        return 'text-slate-300 border-slate-800/40 bg-slate-900/20';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96">
      {/* Toggle Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/95 hover:bg-slate-850 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md transition group text-left"
      >
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span className="font-cinzel font-bold text-xs text-slate-200">
            Combat Chronicle
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono-code text-amber-300">
            {logs.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
        )}
      </button>

      {/* Expanded Log Drawer */}
      {isOpen && (
        <div className="mt-2 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-lg overflow-hidden flex flex-col h-72">
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-slate-400 font-bold">
              Battle History
            </span>
            <span className="text-[10px] text-slate-500 font-mono-code">Latest First</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 flex flex-col-reverse">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 italic">
                No battle records yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border text-xs leading-relaxed transition ${getLogClasses(
                    log.type
                  )}`}
                >
                  <div className="mt-0.5">{getLogIcon(log.type)}</div>
                  <div className="flex-1">
                    <span className="text-[10px] opacity-60 font-mono-code mr-1.5">
                      [R{log.round}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
