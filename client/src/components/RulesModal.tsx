import React from 'react';
import { X, BookOpen, Swords, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-white">Codex of War & Modifiers</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-300 pr-1">
          {/* Section 1: Objective */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <h4 className="font-cinzel font-bold text-amber-400 flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4" /> 1. Objective & Starting Deal
            </h4>
            <p>
              Win by depleting your opponent's hand to <strong>0 cards</strong>. Players are dealt <strong>5 Normal Cards</strong> from a shared 54-card deck (52 standard cards + 2 Jokers) and <strong>1 starting Modifier Card</strong>.
            </p>
          </div>

          {/* Section 2: Turn Sequence */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <h4 className="font-cinzel font-bold text-amber-400 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4" /> 2. Turn Sequence (Face Down)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li><strong>Play a Modifier Card:</strong> (Optional) Choose 1 modifier from your modifier hand.</li>
              <li><strong>Play a Normal Card:</strong> (Required) Choose 1 normal card from your hand.</li>
              <li><strong>Confirm:</strong> Both cards are committed face down. The opponent can see if you played a modifier, but not which one.</li>
            </ol>
          </div>

          {/* Section 3: Battle Reveal Priority */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <h4 className="font-cinzel font-bold text-amber-400 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" /> 3. Battle Clash & Flip Priority
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li><strong>Normal Reveal:</strong> Both normal cards flip over first simultaneously.</li>
              <li><strong>Tentative Leader:</strong> The player who would win without modifiers flips their modifier <strong>FIRST</strong> and resolves it.</li>
              <li><strong>Second Flip (Counterplay):</strong> The other player then flips their modifier second, potentially reversing or altering the outcome!</li>
              <li>
                <strong>Tied Base Cards Priority:</strong> If normal cards tie:
                <ul className="list-circle list-inside pl-4 text-xs text-slate-400 mt-0.5 space-y-0.5">
                  <li>The player winning overall (more cards in hand) flips <strong>SECOND</strong> (fewer cards in hand flips FIRST).</li>
                  <li>If hand sizes are tied: player with more modifier cards in hand flips FIRST.</li>
                  <li>If still tied: coin flip decides.</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Section 4: Jokers & Tie War Stakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-amber-900/30 p-3.5 rounded-xl">
              <h4 className="font-cinzel font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Jokers (Rank 15)
              </h4>
              <p className="text-xs">
                Jokers beat all normal cards (even Aces), <strong>BUT</strong> playing a Joker immediately resets your Modifier Meter to 0 and grants <strong>no meter</strong> for that round!
              </p>
            </div>

            <div className="bg-slate-900/60 border border-red-900/30 p-3.5 rounded-xl">
              <h4 className="font-cinzel font-bold text-red-400 flex items-center gap-1.5 mb-1">
                <Swords className="w-4 h-4 text-red-400" /> Stalemate / War Stakes
              </h4>
              <p className="text-xs">
                When a round ties, the next round becomes <strong>doubled stakes (2x, 4x, etc.)</strong>! The victor of the next round claims both rounds' spoils. Stacks on consecutive ties!
              </p>
            </div>
          </div>

          {/* Section 5: The Modifier Meter */}
          <div className="bg-slate-900/60 border border-purple-900/40 p-3.5 rounded-xl">
            <h4 className="font-cinzel font-bold text-purple-400 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" /> 4. Modifier Meter (Catch-Up System)
            </h4>
            <p>
              Your Modifier Bar charges as you fight: <strong>+1 point on a win</strong> and <strong>+2 points on a loss</strong> (filling twice as fast when losing!). Once the meter reaches 10 points (5 losses or 10 wins), you automatically draw a new Modifier Card and your meter resets to 0.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
