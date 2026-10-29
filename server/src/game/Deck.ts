import { Card, ModifierCard, ModifierType, Suit } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class DeckManager {
  private deck: Card[] = [];
  private discardPile: Card[] = [];
  private modifierDeck: ModifierCard[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.deck = this.createStandard54Deck();
    this.discardPile = [];
    this.modifierDeck = this.createModifierDeck();
    this.shuffle(this.deck);
    this.shuffle(this.modifierDeck);
  }

  private createStandard54Deck(): Card[] {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const cards: Card[] = [];

    // 52 Standard cards
    for (const suit of suits) {
      const color = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
      for (let rank = 2; rank <= 14; rank++) {
        let label = rank.toString();
        if (rank === 11) label = 'J';
        else if (rank === 12) label = 'Q';
        else if (rank === 13) label = 'K';
        else if (rank === 14) label = 'A';

        cards.push({
          id: `card-${suit}-${rank}-${uuidv4().substring(0, 8)}`,
          suit,
          rank,
          label,
          color,
        });
      }
    }

    // 2 Jokers (Rank 15)
    cards.push({
      id: `card-joker-red-${uuidv4().substring(0, 8)}`,
      suit: 'joker',
      rank: 15,
      label: 'Joker',
      color: 'red',
    });

    cards.push({
      id: `card-joker-black-${uuidv4().substring(0, 8)}`,
      suit: 'joker',
      rank: 15,
      label: 'Joker',
      color: 'black',
    });

    return cards;
  }

  private createModifierDeck(): ModifierCard[] {
    const templates: Array<{ type: ModifierType; title: string; description: string; badge: string; rarity: 'common' | 'rare' | 'epic'; copies: number }> = [
      {
        type: 'INVERSION',
        title: 'The Inversion',
        description: 'Lowest card wins this round instead of the highest.',
        badge: 'LOW WINS',
        rarity: 'common',
        copies: 3,
      },
      {
        type: 'MEDIAN',
        title: 'The Golden Mean',
        description: 'The card closest in rank to 7 wins this round.',
        badge: 'CLOSEST 7',
        rarity: 'common',
        copies: 3,
      },
      {
        type: 'OVERKILL',
        title: 'Overkill',
        description: 'The losing player loses 1 additional card from their hand.',
        badge: '+1 DAMAGE',
        rarity: 'common',
        copies: 3,
      },
      {
        type: 'NULLIFY',
        title: 'Nullify',
        description: 'Cancels and negates the opponent\'s modifier card this round.',
        badge: 'COUNTER',
        rarity: 'rare',
        copies: 3,
      },
      {
        type: 'DOUBLE_DOWN',
        title: 'Double Down',
        description: 'Winner draws 2 cards; loser discards 1 extra card.',
        badge: 'HIGH STAKES',
        rarity: 'rare',
        copies: 2,
      },
      {
        type: 'PICKPOCKET',
        title: 'Pickpocket',
        description: 'If you win, steal the loser\'s played card into your hand.',
        badge: 'STEAL CARD',
        rarity: 'rare',
        copies: 2,
      },
      {
        type: 'TACTICAL_RETREAT',
        title: 'Tactical Retreat',
        description: 'If you lose, your played card returns safely to your hand.',
        badge: 'PRESERVE',
        rarity: 'common',
        copies: 3,
      },
      {
        type: 'RANK_BOOST',
        title: 'Ascension',
        description: 'Grants +3 rank power to your played card this round.',
        badge: '+3 RANK',
        rarity: 'common',
        copies: 3,
      },
      {
        type: 'TIE_BREAKER',
        title: 'Vanguard\'s Edge',
        description: 'If this round ends in a tie, you automatically win.',
        badge: 'BREAK TIE',
        rarity: 'rare',
        copies: 2,
      },
      {
        type: 'TRUMP_SPADES',
        title: 'Spade Sovereign',
        description: 'Spades beats all other suits this round regardless of rank.',
        badge: '♠ TRUMP',
        rarity: 'rare',
        copies: 1,
      },
      {
        type: 'TRUMP_HEARTS',
        title: 'Heart Sovereign',
        description: 'Hearts beats all other suits this round regardless of rank.',
        badge: '♥ TRUMP',
        rarity: 'rare',
        copies: 1,
      },
      {
        type: 'TRUMP_DIAMONDS',
        title: 'Diamond Sovereign',
        description: 'Diamonds beats all other suits this round regardless of rank.',
        badge: '♦ TRUMP',
        rarity: 'rare',
        copies: 1,
      },
      {
        type: 'TRUMP_CLUBS',
        title: 'Club Sovereign',
        description: 'Clubs beats all other suits this round regardless of rank.',
        badge: '♣ TRUMP',
        rarity: 'rare',
        copies: 1,
      },
    ];

    const cards: ModifierCard[] = [];
    for (const t of templates) {
      for (let i = 0; i < t.copies; i++) {
        cards.push({
          id: `mod-${t.type.toLowerCase()}-${uuidv4().substring(0, 8)}`,
          type: t.type,
          title: t.title,
          description: t.description,
          badge: t.badge,
          rarity: t.rarity,
        });
      }
    }
    return cards;
  }

  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  public drawCard(): Card | null {
    if (this.deck.length === 0) {
      if (this.discardPile.length === 0) {
        return null; // Entire deck exhausted
      }
      // Reshuffle discard pile into deck
      this.deck = [...this.discardPile];
      this.discardPile = [];
      this.shuffle(this.deck);
    }
    return this.deck.pop() || null;
  }

  public drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  public drawModifier(): ModifierCard | null {
    if (this.modifierDeck.length === 0) {
      // Re-generate and shuffle modifiers
      this.modifierDeck = this.createModifierDeck();
      this.shuffle(this.modifierDeck);
    }
    return this.modifierDeck.pop() || null;
  }

  public discard(cards: Card[]): void {
    this.discardPile.push(...cards);
  }

  public getDeckCount(): number {
    return this.deck.length;
  }

  public getDiscardCount(): number {
    return this.discardPile.length;
  }
}
