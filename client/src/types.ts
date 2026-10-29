export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 2-10, 11 (J), 12 (Q), 13 (K), 14 (A), 15 (Joker)
  label: string; // '2'-'10', 'J', 'Q', 'K', 'A', 'Joker'
  color: 'red' | 'black';
}

export type ModifierType =
  | 'INVERSION'          // Lowest card wins instead of highest
  | 'MEDIAN'             // Card closest to rank 7 wins
  | 'OVERKILL'           // Losing player loses 1 additional card from hand
  | 'TRUMP_SPADES'       // Spades beats other suits regardless of rank
  | 'TRUMP_HEARTS'       // Hearts beats other suits regardless of rank
  | 'TRUMP_DIAMONDS'     // Diamonds beats other suits regardless of rank
  | 'TRUMP_CLUBS'        // Clubs beats other suits regardless of rank
  | 'NULLIFY'            // Cancels the opponent's modifier card this round
  | 'PICKPOCKET'         // Winner takes loser's played card into hand instead of discard
  | 'DOUBLE_DOWN'        // Winner draws 2 cards; loser discards 1 extra card
  | 'TACTICAL_RETREAT'   // If you lose, your played card returns to your hand
  | 'TIE_BREAKER'        // If the round is tied, you win the round
  | 'RANK_BOOST';        // Adds +3 to your played card's rank

export interface ModifierCard {
  id: string;
  type: ModifierType;
  title: string;
  description: string;
  badge: string;
  rarity: 'common' | 'rare' | 'epic';
}

export type GamePhase =
  | 'LOBBY'
  | 'SELECTING'
  | 'REVEAL_NORMAL'
  | 'REVEAL_MODIFIER_1'
  | 'REVEAL_MODIFIER_2'
  | 'RESOLVING_ROUND'
  | 'GAME_OVER';

export interface PlayerPublicState {
  id: string;
  name: string;
  handCount: number;
  modifierCount: number;
  modifierMeter: number; // 0 to 10
  hasPlayedModifier: boolean;
  hasPlayedCard: boolean;
  hasConfirmed: boolean;
  playedCard: Card | null; // null during SELECTING until revealed
  playedModifier: ModifierCard | null; // null during SELECTING until revealed
  isBot?: boolean;
}

export interface PlayerPrivateState extends PlayerPublicState {
  hand: Card[];
  modifiers: ModifierCard[];
  selectedCardId: string | null;
  selectedModifierId: string | null;
}

export interface RoundResolution {
  winnerId: string | null; // null if tie
  isTie: boolean;
  stakes: number; // multiplier or count of spoils
  firstModifierRevealedBy: string | null;
  secondModifierRevealedBy: string | null;
  firstModifierEffect: string | null;
  secondModifierEffect: string | null;
  logMessages: string[];
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  roundNumber: number;
  warStakes: number; // starts at 1, doubles or adds on ties
  deckCount: number;
  discardCount: number;
  players: Record<string, PlayerPublicState>;
  playerOrder: string[]; // [player1Id, player2Id]
  activeResolution: RoundResolution | null;
  winnerId: string | null; // game winner
  phaseTimer: number | null; // remaining seconds for phase if applicable
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  round: number;
  message: string;
  type: 'info' | 'battle' | 'modifier' | 'tie' | 'victory' | 'danger';
}

// Socket Events
export interface ServerToClientEvents {
  gameUpdated: (state: GameState) => void;
  privateStateUpdated: (privateState: PlayerPrivateState) => void;
  roundPhaseAdvanced: (data: { phase: GamePhase; message: string; resolution?: RoundResolution }) => void;
  newLog: (entry: GameLogEntry) => void;
  errorMessage: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { playerName: string }, callback: (res: { success: boolean; roomId?: string; error?: string }) => void) => void;
  joinRoom: (data: { roomId: string; playerName: string }, callback: (res: { success: boolean; error?: string }) => void) => void;
  createBotGame: (data: { playerName: string }, callback: (res: { success: boolean; roomId?: string; error?: string }) => void) => void;
  cancelRoom: () => void;
  selectCard: (cardId: string) => void;
  selectModifier: (modifierId: string | null) => void;
  confirmTurn: () => void;
  rematch: () => void;
}
