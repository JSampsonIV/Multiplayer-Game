import React from 'react';
import { Card, GamePhase, ModifierCard as ModifierCardType, PlayerPrivateState } from '../types';
import { PlayingCard } from './PlayingCard';
import { ModifierCard } from './ModifierCard';
import { ModifierMeter } from './ModifierMeter';
import { Check, X, AlertTriangle, Layers, Zap } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface PlayerHandProps {
  player: PlayerPrivateState;
  phase: GamePhase;
  onSelectCard: (cardId: string) => void;
  onSelectModifier: (modifierId: string | null) => void;
  onConfirm: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  phase,
  onSelectCard,
  onSelectModifier,
  onConfirm,
}) => {
  const isSelecting = phase === 'SELECTING' && !player.hasConfirmed;
  const selectedCard = player.hand.find((c) => c.id === player.selectedCardId) || null;
  const isJokerSelected = selectedCard?.rank === 15;

  const handleCardClick = (card: Card) => {
    if (!isSelecting) return;
    soundManager.playCardSelect();
    onSelectCard(card.id);
  };

  const handleModifierClick = (mod: ModifierCardType) => {
    if (!isSelecting) return;
    soundManager.playCardSelect();
    if (player.selectedModifierId === mod.id) {
      onSelectModifier(null);
    } else {
      onSelectModifier(mod.id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 px-4 pb-4">
      {/* Hand Status & Modifier Meter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono-code">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Cards in Hand: <strong className="text-amber-400">{player.hand.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono-code">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Modifiers: <strong className="text-purple-400">{player.modifiers.length}</strong></span>
          </div>
        </div>

        {/* Modifier Meter */}
        <div className="w-full sm:w-auto">
          <ModifierMeter meter={player.modifierMeter} isCompact />
        </div>
      </div>

      {/* Action / Warning Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          {isJokerSelected && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-lg animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Joker Alert:</strong> Meter will reset to 0 & gain +0 meter this round!</span>
            </div>
          )}
          {!isJokerSelected && (
            <div className="text-xs text-slate-400">
              {isSelecting
                ? 'Select 1 Normal Card (and optional Modifier), then click Confirm.'
                : 'Turn submitted. Awaiting round resolution...'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isSelecting && (
          <div className="flex items-center gap-2">
            {player.selectedModifierId && (
              <button
                onClick={() => onSelectModifier(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                <X className="w-3.5 h-3.5" /> Clear Modifier
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playCardPlace();
                onConfirm();
              }}
              disabled={!player.selectedCardId}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider transition shadow-lg ${
                player.selectedCardId
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Check className="w-4 h-4" /> Confirm Move
            </button>
          </div>
        )}
      </div>

      {/* Cards Area: Modifier Hand & Normal Hand */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Modifiers Section (Left) */}
        <div className="md:col-span-4 bg-slate-900/60 border border-purple-900/40 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-cinzel font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Modifier Hand ({player.modifiers.length})
            </span>
            <span className="text-[10px] text-slate-400">Optional</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center min-h-[140px] justify-start overflow-x-auto py-1">
            {player.modifiers.length === 0 ? (
              <div className="w-full text-center py-6 text-xs text-slate-500 italic">
                No modifier cards held. Fill your meter to earn more!
              </div>
            ) : (
              player.modifiers.map((mod) => (
                <ModifierCard
                  key={mod.id}
                  card={mod}
                  size="sm"
                  isPlayable={isSelecting}
                  isSelected={player.selectedModifierId === mod.id}
                  onClick={() => handleModifierClick(mod)}
                />
              ))
            )}
          </div>
        </div>

        {/* Normal Cards Section (Right) */}
        <div className="md:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Normal Hand ({player.hand.length})
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">1 Required</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center min-h-[140px] justify-start overflow-x-auto py-1">
            {player.hand.map((card) => (
              <PlayingCard
                key={card.id}
                card={card}
                size="md"
                isPlayable={isSelecting}
                isSelected={player.selectedCardId === card.id}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
