import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Layers, Trash2, Copy, Check, LogOut } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { RulesModal } from './RulesModal';

interface GameHeaderProps {
  roomId: string;
  deckCount: number;
  discardCount: number;
  onLeaveRoom: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  deckCount,
  discardCount,
  onLeaveRoom,
}) => {
  const [isMuted, setIsMuted] = useState(!soundManager.enabled);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    soundManager.enabled = !soundManager.enabled;
    setIsMuted(!soundManager.enabled);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-3">
        <h1 className="font-cinzel font-black text-sm sm:text-base tracking-wider text-amber-400">
          WAR: MODIFIERS
        </h1>

        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-white transition cursor-pointer text-xs font-mono-code font-bold"
          title="Click to copy room code"
        >
          <span>ROOM: {roomId}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Deck & Discard Metrics */}
      <div className="hidden sm:flex items-center gap-4 text-xs font-mono-code text-slate-400">
        <div className="flex items-center gap-1.5" title="Cards remaining in draw deck">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Deck: <strong className="text-slate-200">{deckCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5" title="Cards in discard pile">
          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Discard: <strong className="text-slate-200">{discardCount}</strong></span>
        </div>
      </div>

      {/* Utility Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRulesOpen(true)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Game Rules"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onLeaveRoom}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-700 text-slate-300 hover:text-rose-300 transition cursor-pointer"
          title="Leave Match"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </header>
  );
};
