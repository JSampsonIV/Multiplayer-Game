import { Card, ModifierCard, ModifierType } from '../types.js';

export interface BotDecision {
  cardId: string;
  modifierId: string | null;
}

export class BotPlayer {
  public static chooseMove(
    hand: Card[],
    modifiers: ModifierCard[],
    botMeter: number,
    opponentHandCount: number,
    opponentModifierCount: number,
    warStakes: number
  ): BotDecision {
    if (hand.length === 0) {
      throw new Error('Bot has no cards to play');
    }

    // Sort hand by rank ascending
    const sortedHand = [...hand].sort((a, b) => a.rank - b.rank);
    const lowestCard = sortedHand[0];
    const highestCard = sortedHand[sortedHand.length - 1];

    let chosenCard: Card = highestCard;
    let chosenModifier: ModifierCard | null = null;

    // Check if we have specific modifiers
    const inversion = modifiers.find((m) => m.type === 'INVERSION');
    const median = modifiers.find((m) => m.type === 'MEDIAN');
    const overkill = modifiers.find((m) => m.type === 'OVERKILL');
    const doubleDown = modifiers.find((m) => m.type === 'DOUBLE_DOWN');
    const nullify = modifiers.find((m) => m.type === 'NULLIFY');
    const rankBoost = modifiers.find((m) => m.type === 'RANK_BOOST');
    const pickpocket = modifiers.find((m) => m.type === 'PICKPOCKET');
    const tieBreaker = modifiers.find((m) => m.type === 'TIE_BREAKER');

    // Strategy 1: Inversion combo (play 2, 3, or 4 with Inversion)
    if (inversion && lowestCard.rank <= 5) {
      chosenCard = lowestCard;
      chosenModifier = inversion;
    }
    // Strategy 2: Median combo (play 6, 7, 8 with Median)
    else if (median) {
      const nearSeven = sortedHand.find((c) => Math.abs(c.rank - 7) <= 1);
      if (nearSeven) {
        chosenCard = nearSeven;
        chosenModifier = median;
      }
    }
    // Strategy 3: Overkill or Double Down with top tier card (Ace, King, Joker)
    else if ((overkill || doubleDown) && highestCard.rank >= 13) {
      // Don't waste Joker if bot meter is almost full (e.g. 7-9 points)
      if (highestCard.rank === 15 && botMeter >= 7 && sortedHand.length > 1) {
        // Save Joker, play next highest
        chosenCard = sortedHand[sortedHand.length - 2];
      } else {
        chosenCard = highestCard;
      }
      chosenModifier = overkill || doubleDown || null;
    }
    // Strategy 4: Rank boost on medium card (9, 10, Jack)
    else if (rankBoost) {
      const midCard = sortedHand.find((c) => c.rank >= 9 && c.rank <= 11);
      if (midCard) {
        chosenCard = midCard;
        chosenModifier = rankBoost;
      }
    }
    // Strategy 5: Counterspell / Nullify if opponent has modifiers and war stakes are high
    else if (nullify && opponentModifierCount > 0 && (warStakes > 1 || Math.random() < 0.4)) {
      chosenCard = highestCard;
      chosenModifier = nullify;
    }
    // Strategy 6: Pickpocket or Tiebreaker with strong card
    else if ((pickpocket || tieBreaker) && highestCard.rank >= 11) {
      chosenCard = highestCard;
      chosenModifier = pickpocket || tieBreaker || null;
    }
    // Default: choose based on hand composition
    else {
      // Avoid playing Joker if meter is almost full (Joker resets meter to 0)
      if (highestCard.rank === 15 && botMeter >= 6 && sortedHand.length > 1) {
        chosenCard = sortedHand[sortedHand.length - 2];
      } else {
        // Play moderately high card or highest if stakes are high
        if (warStakes > 1 || opponentHandCount <= 2) {
          chosenCard = highestCard;
        } else {
          // Play a balanced middle-to-high card
          const midIndex = Math.min(sortedHand.length - 1, Math.floor(sortedHand.length / 2));
          chosenCard = sortedHand[midIndex];
        }
      }
    }

    return {
      cardId: chosenCard.id,
      modifierId: chosenModifier ? chosenModifier.id : null,
    };
  }
}
