import React, { useEffect, useState } from 'react';
import { GameState, PlayerPrivateState, PlayerPublicState } from '../types';
import { PlayingCard } from './PlayingCard';
import { ModifierCard } from './ModifierCard';
import { Swords, Flame, CheckCircle2, Layers, Trash2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface BattleZoneProps {
  gameState: GameState;
  myPlayer: PlayerPrivateState;
  opponent: PlayerPublicState | null;
}

export const BattleZone: React.FC<BattleZoneProps> = ({
  gameState,
  myPlayer,
  opponent,
}) => {
  const { phase, warStakes, activeResolution, deckCount, discardCount } = gameState;

  // Animation states
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [drawingToPlayer, setDrawingToPlayer] = useState<'me' | 'opponent' | null>(null);

  // Normal cards revealed when in reveal phases
  const normalRevealed =
    phase === 'REVEAL_NORMAL' ||
    phase === 'REVEAL_MODIFIER_1' ||
    phase === 'REVEAL_MODIFIER_2' ||
    phase === 'RESOLVING_ROUND' ||
    phase === 'GAME_OVER';

  // Modifier 1 revealed
  const mod1Revealed =
    phase === 'REVEAL_MODIFIER_1' ||
    phase === 'REVEAL_MODIFIER_2' ||
    phase === 'RESOLVING_ROUND' ||
    phase === 'GAME_OVER';

  // Modifier 2 revealed
  const mod2Revealed =
    phase === 'REVEAL_MODIFIER_2' ||
    phase === 'RESOLVING_ROUND' ||
    phase === 'GAME_OVER';

  const firstFlipperId = activeResolution?.firstModifierRevealedBy;
  const secondFlipperId = activeResolution?.secondModifierRevealedBy;

  // Exact reveal flags
  const isMyModRevealed =
    (myPlayer.id === firstFlipperId && mod1Revealed) ||
    (myPlayer.id === secondFlipperId && mod2Revealed) ||
    phase === 'RESOLVING_ROUND';

  const isOpponentModRevealed =
    (opponent?.id === firstFlipperId && mod1Revealed) ||
    (opponent?.id === secondFlipperId && mod2Revealed) ||
    phase === 'RESOLVING_ROUND';

  // Opponent cards
  const opponentPlayedCard = opponent?.playedCard || null;
  const opponentHasNormalCard = opponent?.hasPlayedCard || false;
  const opponentPlayedModifier = opponent?.playedModifier || null;
  const opponentHasModifier = opponent?.hasPlayedModifier || false;

  // My cards
  const myNormalToRender =
    myPlayer.playedCard ||
    (myPlayer.selectedCardId ? myPlayer.hand.find((c) => c.id === myPlayer.selectedCardId) || null : null);

  const myModifierToRender =
    myPlayer.playedModifier ||
    (myPlayer.selectedModifierId ? myPlayer.modifiers.find((m) => m.id === myPlayer.selectedModifierId) || null : null);

  // Detect card draw and discard animations during RESOLVING_ROUND
  useEffect(() => {
    if (phase === 'RESOLVING_ROUND') {
      // 1. Trigger discard animation (cards sliding to the right discard pile)
      setIsDiscarding(true);
      soundManager.playCardPlace();

      const timerDiscard = setTimeout(() => {
        setIsDiscarding(false);

        // 2. Trigger draw animation if there is a decisive winner
        if (activeResolution && !activeResolution.isTie && activeResolution.winnerId) {
          const winnerIsMe = activeResolution.winnerId === myPlayer.id;
          setDrawingToPlayer(winnerIsMe ? 'me' : 'opponent');
          setIsDrawing(true);
          soundManager.playCardFlip();

          setTimeout(() => {
            setIsDrawing(false);
            setDrawingToPlayer(null);
          }, 1100);
        }
      }, 900);

      return () => {
        clearTimeout(timerDiscard);
      };
    } else {
      setIsDiscarding(false);
      setIsDrawing(false);
      setDrawingToPlayer(null);
    }
  }, [phase, activeResolution, myPlayer.id]);

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-2 px-2 sm:px-4">
      {/* War Stakes & Center Arena Header */}
      <div className="flex items-center gap-3 mb-2">
        {warStakes > 1 ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-900/90 via-amber-900/90 to-red-900/90 border-2 border-red-500 text-amber-200 shadow-lg shadow-red-900/50 animate-pulse">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-cinzel font-black text-sm tracking-wider">
              WAR STAKES: {warStakes}X SPOILS!
            </span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-cinzel text-xs font-bold tracking-wider">
              ROUND {gameState.roundNumber || 1}
            </span>
          </div>
        )}
      </div>

      {/* Main Table Mat: 3 Columns (Left: Draw Deck, Center: Battle Slots, Right: Discard Pile) */}
      <div className="w-full rounded-2xl felt-table border-2 border-amber-900/40 p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-row items-center justify-between min-h-[400px]">
        
        {/* ================= LEFT: DRAW DECK ================= */}
        <div className="flex flex-col items-center justify-center w-28 sm:w-36 z-10 select-none">
          <span className="text-[10px] font-cinzel font-bold text-amber-400/90 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" /> Draw Deck
          </span>

          {/* 3D Stack of Cards */}
          <div className="relative group cursor-default">
            {/* Layer 3 (Bottom shadow stack) */}
            <div className="absolute top-2 left-2 w-20 sm:w-24 h-28 sm:h-36 rounded-xl bg-slate-950 border border-indigo-900/50 shadow-md" />
            {/* Layer 2 (Middle stack) */}
            <div className="absolute top-1 left-1 w-20 sm:w-24 h-28 sm:h-36 rounded-xl bg-indigo-950 border border-indigo-800/60 shadow-lg" />
            {/* Top Deck Card */}
            <div
              className={`relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-2 border-indigo-500/50 shadow-2xl p-1.5 flex flex-col items-center justify-center transition-all duration-300 ${
                isDrawing ? 'scale-105 border-amber-400 shadow-amber-500/50' : ''
              }`}
            >
              <div className="w-full h-full rounded border border-dashed border-indigo-400/40 flex flex-col items-center justify-center bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:6px_6px]">
                <div className="w-7 h-7 rounded-full border border-amber-500/40 flex items-center justify-center bg-slate-950/80 shadow-inner">
                  <span className="text-amber-400 font-cinzel text-[10px] font-bold">WAR</span>
                </div>
                <span className="text-xs font-mono-code font-black text-amber-300 mt-1.5">
                  {deckCount}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono-code text-slate-400 mt-1">Cards Left</span>
        </div>

        {/* ================= CENTER: BATTLE CLASH SLOTS ================= */}
        <div className="flex-1 flex flex-col items-center justify-between min-h-[360px] mx-2 sm:mx-6 z-10">
          
          {/* Opponent Area (Top) */}
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-cinzel font-bold text-slate-300">
                {opponent ? opponent.name : 'Waiting for Opponent...'}
              </span>
              {opponent?.hasConfirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              )}
            </div>

            <div
              className={`flex items-center justify-center gap-4 transition-all duration-700 ${
                isDiscarding ? 'translate-x-32 opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              {/* Opponent Modifier Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">Modifier</span>
                {opponentHasModifier ? (
                  <ModifierCard
                    card={opponentPlayedModifier}
                    isFaceDown={!isOpponentModRevealed}
                    size="sm"
                  />
                ) : (
                  <div className="w-24 h-36 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center text-slate-600 text-xs font-cinzel">
                    None
                  </div>
                )}
              </div>

              {/* Opponent Normal Card Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">Normal Card</span>
                {opponentHasNormalCard ? (
                  <PlayingCard
                    card={opponentPlayedCard}
                    isFaceDown={!normalRevealed}
                    size="md"
                  />
                ) : (
                  <div className="w-24 h-36 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center text-slate-600 text-xs font-cinzel">
                    Empty
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center VS Indicator */}
          <div className="my-2 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-cinzel font-bold shadow-lg">
              VS
            </div>
          </div>

          {/* Player Area (Bottom) */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`flex items-center justify-center gap-4 transition-all duration-700 ${
                isDiscarding ? 'translate-x-32 opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              {/* My Modifier Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">Your Modifier</span>
                {myPlayer.selectedModifierId || myPlayer.playedModifier ? (
                  <ModifierCard
                    card={myModifierToRender}
                    isFaceDown={
                      phase === 'SELECTING' && !myPlayer.hasConfirmed
                        ? false
                        : phase === 'SELECTING'
                        ? true
                        : !isMyModRevealed
                    }
                    size="sm"
                  />
                ) : (
                  <div className="w-24 h-36 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center text-slate-600 text-xs font-cinzel">
                    None
                  </div>
                )}
              </div>

              {/* My Normal Card Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">Your Normal Card</span>
                {myPlayer.selectedCardId || myPlayer.playedCard ? (
                  <PlayingCard
                    card={myNormalToRender}
                    isFaceDown={
                      phase === 'SELECTING' && !myPlayer.hasConfirmed
                        ? false
                        : phase === 'SELECTING'
                        ? true
                        : !normalRevealed
                    }
                    size="md"
                  />
                ) : (
                  <div className="w-24 h-36 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center text-slate-600 text-xs font-cinzel">
                    Pick a Card
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-cinzel font-bold text-amber-300">
                {myPlayer.name} (You)
              </span>
              {myPlayer.hasConfirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Locked In
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: DISCARD PILE ================= */}
        <div className="flex flex-col items-center justify-center w-28 sm:w-36 z-10 select-none">
          <span className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Trash2 className="w-3 h-3 text-slate-400" /> Discard
          </span>

          {/* 3D Discard Tray */}
          <div className="relative group cursor-default">
            {discardCount === 0 ? (
              // Empty Discard Tray
              <div className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-950/60 flex flex-col items-center justify-center text-slate-600 text-xs font-cinzel">
                <span>Empty</span>
                <span className="text-[10px] font-mono-code mt-1 text-slate-600">0</span>
              </div>
            ) : (
              // Stacked Discard Cards
              <>
                <div className="absolute top-1 -left-1 w-20 sm:w-24 h-28 sm:h-36 rounded-xl bg-slate-900 border border-slate-700/50 rotate-3 shadow-md" />
                <div
                  className={`relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl bg-slate-900/90 border-2 border-slate-600/80 -rotate-2 shadow-xl p-2 flex flex-col items-center justify-center transition-all duration-300 ${
                    isDiscarding ? 'scale-105 border-amber-400 shadow-amber-500/40' : ''
                  }`}
                >
                  <span className="text-xl">🂠</span>
                  <span className="text-xs font-mono-code font-black text-slate-300 mt-1">
                    {discardCount}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">Cards</span>
                </div>
              </>
            )}
          </div>
          <span className="text-[9px] font-mono-code text-slate-400 mt-1">Graveyard</span>
        </div>

        {/* ================= ANIMATED FLYING CARDS OVERLAY ================= */}
        {/* Draw animation card flying from Left Deck */}
        {isDrawing && (
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-1000 ease-out transform ${
              drawingToPlayer === 'me'
                ? 'left-12 top-1/2 translate-x-32 translate-y-36 scale-75 opacity-0'
                : 'left-12 top-1/2 translate-x-32 -translate-y-36 scale-75 opacity-0'
            }`}
            style={{
              animation: 'flyingDrawCard 1s cubic-bezier(0.25, 1, 0.5, 1) forwards',
            }}
          >
            <PlayingCard card={null} isFaceDown size="sm" />
          </div>
        )}

      </div>
    </div>
  );
};
