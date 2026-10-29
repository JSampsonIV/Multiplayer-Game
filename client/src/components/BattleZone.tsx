import React from 'react';
import { GameState, PlayerPrivateState, PlayerPublicState } from '../types';
import { PlayingCard } from './PlayingCard';
import { ModifierCard } from './ModifierCard';
import { Swords, Flame, CheckCircle2 } from 'lucide-react';

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
  const { phase, warStakes, activeResolution } = gameState;

  // Determine Opponent Cards visibility
  const opponentPlayedCard = opponent?.playedCard || null;
  const opponentHasNormalCard = opponent?.hasPlayedCard || false;
  const opponentPlayedModifier = opponent?.playedModifier || null;
  const opponentHasModifier = opponent?.hasPlayedModifier || false;

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

  const isMyModRevealed =
    (myPlayer.id === firstFlipperId && mod1Revealed) ||
    (myPlayer.id === secondFlipperId && mod2Revealed) ||
    phase === 'RESOLVING_ROUND';

  const isOpponentModRevealed =
    (opponent?.id === firstFlipperId && mod1Revealed) ||
    (opponent?.id === secondFlipperId && mod2Revealed) ||
    phase === 'RESOLVING_ROUND';

  // Opponent card objects during SELECTING vs REVEAL
  const opponentNormalToRender = normalRevealed ? opponentPlayedCard : null;
  const opponentModifierToRender = isOpponentModRevealed ? opponentPlayedModifier : null;

  // My card objects to render in battle slots
  const myNormalToRender = myPlayer.playedCard || (myPlayer.selectedCardId ? myPlayer.hand.find(c => c.id === myPlayer.selectedCardId) || null : null);
  const myModifierToRender = myPlayer.playedModifier || (myPlayer.selectedModifierId ? myPlayer.modifiers.find(m => m.id === myPlayer.selectedModifierId) || null : null);

  // Status banner text
  let statusBanner = 'Awaiting player orders...';
  let bannerColor = 'text-slate-300 bg-slate-900/80 border-slate-700';

  if (phase === 'SELECTING') {
    if (myPlayer.hasConfirmed && opponent?.hasConfirmed) {
      statusBanner = 'Both players ready! Initiating battle clash...';
      bannerColor = 'text-amber-300 bg-amber-950/60 border-amber-600/50';
    } else if (myPlayer.hasConfirmed) {
      statusBanner = 'Turn locked in! Waiting for opponent...';
      bannerColor = 'text-cyan-300 bg-cyan-950/60 border-cyan-600/50';
    } else {
      statusBanner = 'Choose an optional Modifier, then a Normal Card, and Confirm.';
      bannerColor = 'text-slate-200 bg-slate-900/80 border-slate-700';
    }
  } else if (phase === 'REVEAL_NORMAL') {
    statusBanner = 'Normal Cards Revealed! Evaluating initial advantage...';
    bannerColor = 'text-amber-300 bg-amber-950/80 border-amber-500';
  } else if (phase === 'REVEAL_MODIFIER_1') {
    statusBanner = activeResolution?.firstModifierEffect || 'First Modifier Revealed!';
    bannerColor = 'text-purple-300 bg-purple-950/80 border-purple-500 animate-pulse';
  } else if (phase === 'REVEAL_MODIFIER_2') {
    statusBanner = activeResolution?.secondModifierEffect || 'Second Modifier Revealed!';
    bannerColor = 'text-purple-300 bg-purple-950/80 border-purple-500 animate-pulse';
  } else if (phase === 'RESOLVING_ROUND') {
    if (activeResolution?.isTie) {
      statusBanner = `STALEMATE TIE! Stakes doubled to ${warStakes}x for next round!`;
      bannerColor = 'text-red-300 bg-red-950/90 border-red-500';
    } else if (activeResolution?.winnerId === myPlayer.id) {
      statusBanner = `VICTORY! You won this clash and claimed ${activeResolution.stakes} card(s)!`;
      bannerColor = 'text-emerald-300 bg-emerald-950/90 border-emerald-500';
    } else {
      statusBanner = `DEFEAT! ${opponent?.name || 'Opponent'} won this round.`;
      bannerColor = 'text-rose-300 bg-rose-950/90 border-rose-500';
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-2 px-4">
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
            <span className="font-cinzel text-xs font-bold tracking-wider">ROUND {gameState.roundNumber || 1} CLASH</span>
          </div>
        )}
      </div>

      {/* Main Battle Arena Mat */}
      <div className="w-full rounded-2xl felt-table border-2 border-amber-900/40 p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[360px]">
        
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

          <div className="flex items-center justify-center gap-4">
            {/* Opponent Modifier Slot */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Modifier</span>
              {opponentHasModifier ? (
                <ModifierCard
                  card={opponentModifierToRender}
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
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Normal Card</span>
              {opponentHasNormalCard ? (
                <PlayingCard
                  card={opponentNormalToRender}
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

        {/* Dynamic Center Action Banner */}
        <div className="my-4 w-full max-w-lg z-10">
          <div className={`px-4 py-2 rounded-xl border text-center font-cinzel font-bold text-xs sm:text-sm shadow-xl backdrop-blur-md transition-all duration-300 ${bannerColor}`}>
            {statusBanner}
          </div>
        </div>

        {/* Player Area (Bottom) */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-4">
            {/* My Modifier Slot */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Your Modifier</span>
              {myPlayer.selectedModifierId ? (
                <ModifierCard
                  card={myModifierToRender}
                  isFaceDown={phase === 'SELECTING' && !myPlayer.hasConfirmed ? false : (phase === 'SELECTING' ? true : !isMyModRevealed)}
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
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Your Normal Card</span>
              {myPlayer.selectedCardId ? (
                <PlayingCard
                  card={myNormalToRender}
                  isFaceDown={phase === 'SELECTING' && !myPlayer.hasConfirmed ? false : (phase === 'SELECTING' ? true : !normalRevealed)}
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
    </div>
  );
};
