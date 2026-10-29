import React, { useState } from 'react';
import { Bot, Users, KeyRound, BookOpen, Swords, Sparkles, Copy, Check } from 'lucide-react';
import { RulesModal } from './RulesModal';

interface LobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onCreateBotGame: () => void;
  waitingRoomId: string | null;
  errorMessage: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({
  playerName,
  setPlayerName,
  onCreateRoom,
  onJoinRoom,
  onCreateBotGame,
  waitingRoomId,
  errorMessage,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!waitingRoomId) return;
    navigator.clipboard.writeText(waitingRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Runes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-code font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> STRATEGY CARD BATTLE
          </div>
          <h1 className="font-cinzel font-black text-3xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-md">
            WAR: MODIFIERS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            Classic War meets Tactical Mind Games, Bluffing, & Shift Modifiers.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs text-center font-medium animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Player Name Input */}
        <div className="mb-6">
          <label className="block text-xs uppercase font-mono-code font-bold text-slate-400 mb-1.5">
            Commander Call-Sign
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-100 placeholder-slate-500 text-sm font-semibold outline-none transition"
          />
        </div>

        {/* Waiting for Player Screen */}
        {waitingRoomId ? (
          <div className="bg-slate-900/90 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 animate-spin">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-lg text-white">Room Created!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Share this room code with your opponent to initiate the clash:
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="px-6 py-3 rounded-xl bg-slate-950 border-2 border-amber-400 text-2xl font-mono-code font-black text-amber-300 tracking-widest">
                {waitingRoomId}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-xs text-slate-500 animate-pulse">
              Waiting for player 2 to connect...
            </div>
          </div>
        ) : (
          /* Game Modes Options */
          <div className="space-y-3">
            {/* Quick Play vs Bot */}
            <button
              onClick={onCreateBotGame}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 hover:border-purple-400 shadow-lg hover:shadow-purple-900/30 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-500/50 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-white group-hover:text-purple-300 transition">
                    Practice vs AI Bot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Test your tactical bluffing against a strategic bot instantly
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono-code font-bold text-purple-400 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800">
                Solo
              </span>
            </button>

            {/* Create Room */}
            <button
              onClick={onCreateRoom}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 shadow-lg hover:shadow-amber-900/30 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Create 1v1 Room
                  </h3>
                  <p className="text-xs text-slate-400">
                    Host a private match and invite a friend with a room code
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono-code font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800">
                Host
              </span>
            </button>

            {/* Join Room by Code */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 5-Letter Code..."
                  maxLength={5}
                  className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 text-sm font-mono-code font-bold uppercase outline-none"
                />
              </div>
              <button
                onClick={() => onJoinRoom(joinCode)}
                disabled={joinCode.trim().length === 0}
                className={`w-full sm:w-auto px-5 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition ${
                  joinCode.trim().length > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Join Room
              </button>
            </div>
          </div>
        )}

        {/* Rules Codex Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-cinzel font-bold tracking-wider transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> View Codex of Rules & Modifiers
          </button>
        </div>

      </div>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};
