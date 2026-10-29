import {
  Card,
  GameLogEntry,
  GamePhase,
  GameState,
  ModifierCard,
  PlayerPrivateState,
  PlayerPublicState,
  RoundResolution,
} from '../types.js';
import { DeckManager } from './Deck.js';
import { evaluateRound, EvaluatedBattle, PlayerRoundData } from './Modifiers.js';
import { BotPlayer } from './BotPlayer.js';
import { v4 as uuidv4 } from 'uuid';

interface InternalPlayer {
  id: string;
  name: string;
  socketId: string | null;
  isBot: boolean;
  hand: Card[];
  modifiers: ModifierCard[];
  modifierMeter: number;
  selectedCardId: string | null;
  selectedModifierId: string | null;
  hasConfirmed: boolean;
  playedCard: Card | null;
  playedModifier: ModifierCard | null;
}

export class GameRoom {
  public roomId: string;
  private players: Map<string, InternalPlayer> = new Map();
  private playerOrder: string[] = [];
  private deckManager: DeckManager;
  private phase: GamePhase = 'LOBBY';
  private roundNumber: number = 0;
  private warStakes: number = 1;
  private activeResolution: RoundResolution | null = null;
  private currentBattle: EvaluatedBattle | null = null;
  private winnerId: string | null = null;
  private timers: NodeJS.Timeout[] = [];

  private broadcastCallback: (event: string, data: any) => void;
  private sendToPlayerCallback: (socketId: string, event: string, data: any) => void;

  constructor(
    roomId: string,
    broadcastCallback: (event: string, data: any) => void,
    sendToPlayerCallback: (socketId: string, event: string, data: any) => void
  ) {
    this.roomId = roomId;
    this.deckManager = new DeckManager();
    this.broadcastCallback = broadcastCallback;
    this.sendToPlayerCallback = sendToPlayerCallback;
  }

  public addPlayer(id: string, name: string, socketId: string | null, isBot = false): boolean {
    if (this.players.size >= 2) return false;

    this.players.set(id, {
      id,
      name,
      socketId,
      isBot,
      hand: [],
      modifiers: [],
      modifierMeter: 0,
      selectedCardId: null,
      selectedModifierId: null,
      hasConfirmed: false,
      playedCard: null,
      playedModifier: null,
    });
    this.playerOrder.push(id);

    this.emitLog(`${name} joined the room.`, 'info');

    if (this.players.size === 2) {
      this.startGame();
    } else {
      this.broadcastState();
    }

    return true;
  }

  public removePlayer(id: string): void {
    const player = this.players.get(id);
    if (player) {
      this.emitLog(`${player.name} left the game.`, 'danger');
      this.clearAllTimers();
      this.players.delete(id);
      this.playerOrder = this.playerOrder.filter((pId) => pId !== id);

      // If one player remains, declare them winner if in game
      if (this.phase !== 'LOBBY' && this.phase !== 'GAME_OVER' && this.players.size === 1) {
        const remainingId = this.playerOrder[0];
        const remainingPlayer = this.players.get(remainingId);
        if (remainingPlayer) {
          this.winnerId = remainingId;
          this.phase = 'GAME_OVER';
          this.emitLog(`${remainingPlayer.name} wins by forfeit!`, 'victory');
        }
      }
      this.broadcastState();
    }
  }

  public startGame(): void {
    this.clearAllTimers();
    this.deckManager.reset();
    this.roundNumber = 0;
    this.warStakes = 1;
    this.winnerId = null;
    this.activeResolution = null;
    this.currentBattle = null;

    // Deal 5 normal cards and 1 modifier to each player
    for (const player of this.players.values()) {
      player.hand = this.deckManager.drawCards(5);
      const mod = this.deckManager.drawModifier();
      player.modifiers = mod ? [mod] : [];
      player.modifierMeter = 0;
      player.selectedCardId = null;
      player.selectedModifierId = null;
      player.hasConfirmed = false;
      player.playedCard = null;
      player.playedModifier = null;
    }

    this.emitLog('The game has begun! 5 cards and 1 modifier dealt to each player.', 'info');
    this.startRound();
  }

  private startRound(): void {
    this.roundNumber += 1;
    this.phase = 'SELECTING';
    this.activeResolution = null;
    this.currentBattle = null;

    for (const player of this.players.values()) {
      player.selectedCardId = null;
      player.selectedModifierId = null;
      player.hasConfirmed = false;
      player.playedCard = null;
      player.playedModifier = null;
    }

    if (this.warStakes > 1) {
      this.emitLog(`Round ${this.roundNumber} begins! WAR STAKES: ${this.warStakes}x spoils!`, 'tie');
    } else {
      this.emitLog(`Round ${this.roundNumber} - Choose your cards and confirm.`, 'info');
    }

    this.broadcastState();

    // Trigger Bot move if present
    this.triggerBotIfActive();
  }

  private triggerBotIfActive(): void {
    for (const player of this.players.values()) {
      if (player.isBot && !player.hasConfirmed) {
        const opponentId = this.playerOrder.find((id) => id !== player.id);
        const opponent = opponentId ? this.players.get(opponentId) : null;

        const delay = 1200 + Math.random() * 1200;
        const timer = setTimeout(() => {
          if (this.phase !== 'SELECTING' || player.hasConfirmed) return;
          try {
            const decision = BotPlayer.chooseMove(
              player.hand,
              player.modifiers,
              player.modifierMeter,
              opponent ? opponent.hand.length : 5,
              opponent ? opponent.modifiers.length : 1,
              this.warStakes
            );

            this.selectCard(player.id, decision.cardId);
            if (decision.modifierId) {
              this.selectModifier(player.id, decision.modifierId);
            }
            this.confirmTurn(player.id);
          } catch (e) {
            console.error('Bot move error:', e);
          }
        }, delay);
        this.timers.push(timer);
      }
    }
  }

  public selectCard(playerId: string, cardId: string): void {
    if (this.phase !== 'SELECTING') return;
    const player = this.players.get(playerId);
    if (!player || player.hasConfirmed) return;

    const card = player.hand.find((c) => c.id === cardId);
    if (card) {
      player.selectedCardId = cardId;
      this.broadcastState();
    }
  }

  public selectModifier(playerId: string, modifierId: string | null): void {
    if (this.phase !== 'SELECTING') return;
    const player = this.players.get(playerId);
    if (!player || player.hasConfirmed) return;

    if (modifierId === null) {
      player.selectedModifierId = null;
    } else {
      const mod = player.modifiers.find((m) => m.id === modifierId);
      if (mod) {
        player.selectedModifierId = modifierId;
      }
    }
    this.broadcastState();
  }

  public confirmTurn(playerId: string): void {
    if (this.phase !== 'SELECTING') return;
    const player = this.players.get(playerId);
    if (!player || player.hasConfirmed) return;
    if (!player.selectedCardId) return; // Must have a normal card selected

    player.hasConfirmed = true;
    player.playedCard = player.hand.find((c) => c.id === player.selectedCardId) || null;
    player.playedModifier = player.selectedModifierId
      ? player.modifiers.find((m) => m.id === player.selectedModifierId) || null
      : null;

    this.emitLog(`${player.name} locked in their move.`, 'info');
    this.broadcastState();

    // Check if both players confirmed
    const allConfirmed = Array.from(this.players.values()).every((p) => p.hasConfirmed);
    if (allConfirmed && this.players.size === 2) {
      this.beginBattle();
    }
  }

  private beginBattle(): void {
    const p1 = this.players.get(this.playerOrder[0])!;
    const p2 = this.players.get(this.playerOrder[1])!;

    const p1Data: PlayerRoundData = {
      id: p1.id,
      name: p1.name,
      handCount: p1.hand.length,
      modifierCount: p1.modifiers.length,
      card: p1.playedCard!,
      modifier: p1.playedModifier,
    };

    const p2Data: PlayerRoundData = {
      id: p2.id,
      name: p2.name,
      handCount: p2.hand.length,
      modifierCount: p2.modifiers.length,
      card: p2.playedCard!,
      modifier: p2.playedModifier,
    };

    // Calculate battle logic
    this.currentBattle = evaluateRound(p1Data, p2Data);

    // Phase 1: REVEAL NORMAL CARDS
    this.phase = 'REVEAL_NORMAL';
    this.emitLog(
      `Battle begins! Normal cards revealed: ${p1.name} plays ${p1.playedCard!.label} of ${p1.playedCard!.suit} vs ${p2.name}'s ${p2.playedCard!.label} of ${p2.playedCard!.suit}!`,
      'battle'
    );
    this.broadcastState();

    // Step 2: REVEAL MODIFIER 1 (Tentative winner flips first or tiebreaker flipper)
    const t1 = setTimeout(() => {
      this.revealFirstModifier();
    }, 2400);
    this.timers.push(t1);
  }

  private revealFirstModifier(): void {
    if (!this.currentBattle) return;
    this.phase = 'REVEAL_MODIFIER_1';

    const firstPlayer = this.players.get(this.currentBattle.firstFlipperId);
    if (firstPlayer) {
      if (this.currentBattle.firstModifier) {
        this.emitLog(
          `${firstPlayer.name} reveals modifier: ${this.currentBattle.firstModifier.title} - ${this.currentBattle.firstModifier.description}`,
          'modifier'
        );
      } else {
        this.emitLog(`${firstPlayer.name} has no modifier card to reveal.`, 'info');
      }
    }

    this.broadcastState();

    // Step 3: REVEAL MODIFIER 2
    const t2 = setTimeout(() => {
      this.revealSecondModifier();
    }, 2400);
    this.timers.push(t2);
  }

  private revealSecondModifier(): void {
    if (!this.currentBattle) return;
    this.phase = 'REVEAL_MODIFIER_2';

    const secondPlayer = this.players.get(this.currentBattle.secondFlipperId);
    if (secondPlayer) {
      if (this.currentBattle.secondModifier) {
        this.emitLog(
          `${secondPlayer.name} reveals modifier: ${this.currentBattle.secondModifier.title} - ${this.currentBattle.secondModifier.description}`,
          'modifier'
        );
      } else {
        this.emitLog(`${secondPlayer.name} has no modifier card to reveal.`, 'info');
      }
    }

    this.broadcastState();

    // Step 4: RESOLVE ROUND
    const t3 = setTimeout(() => {
      this.resolveRound();
    }, 2600);
    this.timers.push(t3);
  }

  private resolveRound(): void {
    if (!this.currentBattle) return;
    this.phase = 'RESOLVING_ROUND';

    const p1 = this.players.get(this.playerOrder[0])!;
    const p2 = this.players.get(this.playerOrder[1])!;
    const battle = this.currentBattle;

    const resolution: RoundResolution = {
      winnerId: battle.finalWinnerId,
      isTie: battle.isFinalTie,
      stakes: this.warStakes,
      firstModifierRevealedBy: battle.firstFlipperId,
      secondModifierRevealedBy: battle.secondFlipperId,
      firstModifierEffect: battle.firstModifierLog,
      secondModifierEffect: battle.secondModifierLog,
      logMessages: battle.logMessages,
    };
    this.activeResolution = resolution;

    // Apply card removals from hand
    p1.hand = p1.hand.filter((c) => c.id !== p1.playedCard!.id);
    p2.hand = p2.hand.filter((c) => c.id !== p2.playedCard!.id);

    // Discard used modifiers
    if (p1.playedModifier) {
      p1.modifiers = p1.modifiers.filter((m) => m.id !== p1.playedModifier!.id);
    }
    if (p2.playedModifier) {
      p2.modifiers = p2.modifiers.filter((m) => m.id !== p2.playedModifier!.id);
    }

    // Jokers check:
    // "Jokers are highest rank, but resets the modifier meter of the person who played it to 0 and does not grant meter"
    const p1PlayedJoker = p1.playedCard!.rank === 15;
    const p2PlayedJoker = p2.playedCard!.rank === 15;

    if (p1PlayedJoker) {
      p1.modifierMeter = 0;
      this.emitLog(`${p1.name} played a Joker! Modifier meter reset to 0!`, 'danger');
    }
    if (p2PlayedJoker) {
      p2.modifierMeter = 0;
      this.emitLog(`${p2.name} played a Joker! Modifier meter reset to 0!`, 'danger');
    }

    if (battle.isFinalTie) {
      // Tie outcome
      this.warStakes *= 2;
      this.deckManager.discard([p1.playedCard!, p2.playedCard!]);
      this.emitLog(`Stalemate! Both cards discarded. Next round is DOUBLED STAKES (${this.warStakes}x)!`, 'tie');
    } else {
      // Decisive winner
      const winner = battle.finalWinnerId === p1.id ? p1 : p2;
      const loser = battle.finalWinnerId === p1.id ? p2 : p1;
      const winnerPlayedJoker = winner.id === p1.id ? p1PlayedJoker : p2PlayedJoker;
      const loserPlayedJoker = loser.id === p1.id ? p1PlayedJoker : p2PlayedJoker;

      const winnerExtraDraw = winner.id === p1.id ? battle.p1ExtraDraw : battle.p2ExtraDraw;
      const loserExtraDiscard = loser.id === p1.id ? battle.p1ExtraDiscard : battle.p2ExtraDiscard;
      const winnerPickpocket = winner.id === p1.id ? battle.p1Pickpocket : battle.p2Pickpocket;
      const loserTacticalRetreat = loser.id === p1.id ? battle.p1TacticalRetreat : battle.p2TacticalRetreat;

      this.emitLog(`Round Winner: ${winner.name}!`, 'victory');

      // 1. Handle Played Normal Cards
      // Loser's card:
      if (loserTacticalRetreat) {
        loser.hand.push(loser.playedCard!);
        this.emitLog(`${loser.name}'s Tactical Retreat saved their ${loser.playedCard!.label}!`, 'modifier');
      } else if (winnerPickpocket) {
        winner.hand.push(loser.playedCard!);
        this.emitLog(`${winner.name} stole ${loser.name}'s ${loser.playedCard!.label} via Pickpocket!`, 'modifier');
      } else {
        this.deckManager.discard([loser.playedCard!]);
      }

      // Winner's card goes to discard
      this.deckManager.discard([winner.playedCard!]);

      // 2. Winner draws cards: Base 1 * warStakes + winnerExtraDraw
      const totalDrawCount = this.warStakes + winnerExtraDraw;
      const drawnCards = this.deckManager.drawCards(totalDrawCount);
      winner.hand.push(...drawnCards);
      this.emitLog(`${winner.name} draws ${drawnCards.length} card(s) from the deck!`, 'info');

      // 3. Loser discards additional cards if Overkill / Double Down
      if (loserExtraDiscard > 0) {
        const discarded: Card[] = [];
        for (let i = 0; i < loserExtraDiscard; i++) {
          if (loser.hand.length > 0) {
            // Discard lowest or random
            const discardedCard = loser.hand.shift()!;
            discarded.push(discardedCard);
          }
        }
        if (discarded.length > 0) {
          this.deckManager.discard(discarded);
          this.emitLog(
            `Overkill penalty: ${loser.name} loses ${discarded.length} extra card(s) from hand!`,
            'danger'
          );
        }
      }

      // 4. Modifier meter fill:
      // "when a player wins or loses, they fill a modifier card bar, filling twice as fast on a loss (10 wins or 5 losses to get a card, resetting to 0 when a modifier card is drawn)."
      // Joker check: "does not grant meter"
      if (!winnerPlayedJoker) {
        winner.modifierMeter += 1;
        if (winner.modifierMeter >= 10) {
          const newMod = this.deckManager.drawModifier();
          if (newMod) {
            winner.modifiers.push(newMod);
            this.emitLog(`${winner.name} filled the Modifier Bar and gained a Modifier Card!`, 'modifier');
          }
          winner.modifierMeter = 0;
        }
      }

      if (!loserPlayedJoker) {
        loser.modifierMeter += 2;
        if (loser.modifierMeter >= 10) {
          const newMod = this.deckManager.drawModifier();
          if (newMod) {
            loser.modifiers.push(newMod);
            this.emitLog(`${loser.name} filled the Modifier Bar and gained a Modifier Card!`, 'modifier');
          }
          loser.modifierMeter = 0;
        }
      }

      // Reset war stakes after decisive round
      this.warStakes = 1;
    }

    this.broadcastState();

    // Check for Game Over:
    // "they win by making their opponent(s) have no cards in hand"
    if (p1.hand.length === 0 || p2.hand.length === 0) {
      if (p1.hand.length === 0 && p2.hand.length === 0) {
        // Double elimination tie
        this.winnerId = null;
        this.phase = 'GAME_OVER';
        this.emitLog('Both players ran out of cards! It\'s a Draw!', 'tie');
      } else if (p1.hand.length === 0) {
        this.winnerId = p2.id;
        this.phase = 'GAME_OVER';
        this.emitLog(`${p2.name} HAS WON THE WAR! ${p1.name} has no cards left!`, 'victory');
      } else {
        this.winnerId = p1.id;
        this.phase = 'GAME_OVER';
        this.emitLog(`${p1.name} HAS WON THE WAR! ${p2.name} has no cards left!`, 'victory');
      }
      this.broadcastState();
      return;
    }

    // Schedule next round
    const nextRoundTimer = setTimeout(() => {
      this.startRound();
    }, 4000);
    this.timers.push(nextRoundTimer);
  }

  private clearAllTimers(): void {
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.timers = [];
  }

  public getPublicState(): GameState {
    const playersPublic: Record<string, PlayerPublicState> = {};
    for (const [id, player] of this.players.entries()) {
      // Hide card identities until appropriate reveal phase
      const canSeeNormalCard =
        this.phase === 'REVEAL_NORMAL' ||
        this.phase === 'REVEAL_MODIFIER_1' ||
        this.phase === 'REVEAL_MODIFIER_2' ||
        this.phase === 'RESOLVING_ROUND' ||
        this.phase === 'GAME_OVER';

      let canSeeModifierCard = false;
      if (this.currentBattle) {
        if (this.phase === 'REVEAL_MODIFIER_1') {
          canSeeModifierCard = player.id === this.currentBattle.firstFlipperId;
        } else if (
          this.phase === 'REVEAL_MODIFIER_2' ||
          this.phase === 'RESOLVING_ROUND' ||
          this.phase === 'GAME_OVER'
        ) {
          canSeeModifierCard = true;
        }
      }

      playersPublic[id] = {
        id: player.id,
        name: player.name,
        handCount: player.hand.length,
        modifierCount: player.modifiers.length,
        modifierMeter: player.modifierMeter,
        hasPlayedCard: player.selectedCardId !== null,
        hasPlayedModifier: player.selectedModifierId !== null,
        hasConfirmed: player.hasConfirmed,
        playedCard: canSeeNormalCard ? player.playedCard : null,
        playedModifier: canSeeModifierCard ? player.playedModifier : null,
        isBot: player.isBot,
      };
    }

    return {
      roomId: this.roomId,
      phase: this.phase,
      roundNumber: this.roundNumber,
      warStakes: this.warStakes,
      deckCount: this.deckManager.getDeckCount(),
      discardCount: this.deckManager.getDiscardCount(),
      players: playersPublic,
      playerOrder: [...this.playerOrder],
      activeResolution: this.activeResolution,
      winnerId: this.winnerId,
      phaseTimer: null,
    };
  }

  public getPrivateState(playerId: string): PlayerPrivateState | null {
    const player = this.players.get(playerId);
    if (!player) return null;
    const publicState = this.getPublicState().players[playerId];

    return {
      ...publicState,
      hand: [...player.hand],
      modifiers: [...player.modifiers],
      selectedCardId: player.selectedCardId,
      selectedModifierId: player.selectedModifierId,
    };
  }

  public broadcastState(): void {
    const publicState = this.getPublicState();
    this.broadcastCallback('gameUpdated', publicState);

    // Send private state to each connected player
    for (const player of this.players.values()) {
      if (player.socketId) {
        const privateState = this.getPrivateState(player.id);
        if (privateState) {
          this.sendToPlayerCallback(player.socketId, 'privateStateUpdated', privateState);
        }
      }
    }
  }

  private emitLog(message: string, type: GameLogEntry['type']): void {
    const entry: GameLogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      round: this.roundNumber,
      message,
      type,
    };
    this.broadcastCallback('newLog', entry);
  }
}
