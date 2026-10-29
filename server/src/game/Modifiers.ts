import { Card, ModifierCard, ModifierType, RoundResolution } from '../types.js';

export interface PlayerRoundData {
  id: string;
  name: string;
  handCount: number;
  modifierCount: number;
  card: Card;
  modifier: ModifierCard | null;
}

export interface EvaluatedBattle {
  tentativeWinnerId: string | null;
  tentativeIsTie: boolean;
  firstFlipperId: string;
  secondFlipperId: string;
  firstModifier: ModifierCard | null;
  secondModifier: ModifierCard | null;
  firstModifierCancelled: boolean;
  secondModifierCancelled: boolean;
  firstModifierLog: string;
  secondModifierLog: string;
  finalWinnerId: string | null; // null if tie
  isFinalTie: boolean;
  p1FinalRank: number;
  p2FinalRank: number;
  p1ExtraDiscard: number;
  p2ExtraDiscard: number;
  p1ExtraDraw: number;
  p2ExtraDraw: number;
  p1Pickpocket: boolean;
  p2Pickpocket: boolean;
  p1TacticalRetreat: boolean;
  p2TacticalRetreat: boolean;
  logMessages: string[];
}

export function evaluateRound(
  p1: PlayerRoundData,
  p2: PlayerRoundData
): EvaluatedBattle {
  const logMessages: string[] = [];

  // Step 1: Base Rank Comparison
  let p1BaseRank = p1.card.rank;
  let p2BaseRank = p2.card.rank;

  let tentativeWinnerId: string | null = null;
  let tentativeIsTie = false;

  if (p1BaseRank > p2BaseRank) {
    tentativeWinnerId = p1.id;
  } else if (p2BaseRank > p1BaseRank) {
    tentativeWinnerId = p2.id;
  } else {
    tentativeIsTie = true;
  }

  // Step 2: Determine Modifier Reveal Order
  // Rule:
  // If no tie: Tentative winner turns theirs over first!
  // If tie:
  //   - Player who is currently winning overall (more cards in hand) flips SECOND (fewer cards flips FIRST).
  //   - If hand sizes equal: player with more modifier cards flips FIRST.
  //   - If still equal: coin flip.
  let firstFlipperId: string;
  let secondFlipperId: string;

  if (!tentativeIsTie && tentativeWinnerId) {
    firstFlipperId = tentativeWinnerId;
    secondFlipperId = tentativeWinnerId === p1.id ? p2.id : p1.id;
    logMessages.push(
      `${firstFlipperId === p1.id ? p1.name : p2.name} leads with base card ${
        firstFlipperId === p1.id ? p1.card.label : p2.card.label
      } and reveals modifier first!`
    );
  } else {
    // Base tie
    logMessages.push(`Base cards tied (${p1.card.label} vs ${p2.card.label})! Evaluating flip priority...`);
    if (p1.handCount !== p2.handCount) {
      // Player with fewer cards in hand flips first
      if (p1.handCount < p2.handCount) {
        firstFlipperId = p1.id;
        secondFlipperId = p2.id;
      } else {
        firstFlipperId = p2.id;
        secondFlipperId = p1.id;
      }
      logMessages.push(
        `${firstFlipperId === p1.id ? p1.name : p2.name} has fewer cards in hand and reveals first!`
      );
    } else if (p1.modifierCount !== p2.modifierCount) {
      // Player with more modifier cards flips first
      if (p1.modifierCount > p2.modifierCount) {
        firstFlipperId = p1.id;
        secondFlipperId = p2.id;
      } else {
        firstFlipperId = p2.id;
        secondFlipperId = p1.id;
      }
      logMessages.push(
        `${firstFlipperId === p1.id ? p1.name : p2.name} has more modifier cards and reveals first!`
      );
    } else {
      // Coin flip
      const coin = Math.random() < 0.5;
      firstFlipperId = coin ? p1.id : p2.id;
      secondFlipperId = coin ? p2.id : p1.id;
      logMessages.push(`Flip priority decided by coin flip: ${firstFlipperId === p1.id ? p1.name : p2.name} reveals first!`);
    }
  }

  const firstPlayer = firstFlipperId === p1.id ? p1 : p2;
  const secondPlayer = secondFlipperId === p1.id ? p1 : p2;

  const firstModifier = firstPlayer.modifier;
  const secondModifier = secondPlayer.modifier;

  let firstModifierCancelled = false;
  let secondModifierCancelled = false;

  let firstModifierLog = firstModifier ? `${firstPlayer.name} revealed ${firstModifier.title}` : 'No modifier played';
  let secondModifierLog = secondModifier ? `${secondPlayer.name} revealed ${secondModifier.title}` : 'No modifier played';

  // Check NULLIFY logic
  if (firstModifier?.type === 'NULLIFY' && secondModifier) {
    secondModifierCancelled = true;
    secondModifierLog += ` (CANCELLED by ${firstPlayer.name}'s Nullify!)`;
    logMessages.push(`${firstPlayer.name}'s Nullify counters ${secondPlayer.name}'s ${secondModifier.title}!`);
  } else if (secondModifier?.type === 'NULLIFY' && firstModifier) {
    firstModifierCancelled = true;
    firstModifierLog += ` (CANCELLED by ${secondPlayer.name}'s Nullify!)`;
    logMessages.push(`${secondPlayer.name}'s Nullify counters ${firstPlayer.name}'s ${firstModifier.title}!`);
  }

  // Active modifiers list in order of resolution:
  const activeModifiers: Array<{ playerId: string; mod: ModifierCard }> = [];
  if (firstModifier && !firstModifierCancelled) {
    activeModifiers.push({ playerId: firstPlayer.id, mod: firstModifier });
  }
  if (secondModifier && !secondModifierCancelled) {
    activeModifiers.push({ playerId: secondPlayer.id, mod: secondModifier });
  }

  // State flags affected by modifiers:
  let ruleLowestWins = false;
  let ruleMedianWins = false;
  let activeTrumpSuit: string | null = null;
  let p1RankBonus = 0;
  let p2RankBonus = 0;
  let p1TieBreaker = false;
  let p2TieBreaker = false;
  let p1ExtraDiscard = 0;
  let p2ExtraDiscard = 0;
  let p1ExtraDraw = 0;
  let p2ExtraDraw = 0;
  let p1Pickpocket = false;
  let p2Pickpocket = false;
  let p1TacticalRetreat = false;
  let p2TacticalRetreat = false;

  for (const item of activeModifiers) {
    const isP1 = item.playerId === p1.id;
    const mod = item.mod;

    switch (mod.type) {
      case 'INVERSION':
        // Toggles or sets lowest wins
        ruleLowestWins = !ruleLowestWins;
        ruleMedianWins = false; // Overridden
        logMessages.push(`Rule Shift: ${ruleLowestWins ? 'Lowest card wins!' : 'Highest card wins!'}`);
        break;

      case 'MEDIAN':
        ruleMedianWins = true;
        ruleLowestWins = false;
        logMessages.push(`Rule Shift: The card closest in rank to 7 wins!`);
        break;

      case 'TRUMP_SPADES':
        activeTrumpSuit = 'spades';
        logMessages.push(`Rule Shift: Spades are TRUMP!`);
        break;

      case 'TRUMP_HEARTS':
        activeTrumpSuit = 'hearts';
        logMessages.push(`Rule Shift: Hearts are TRUMP!`);
        break;

      case 'TRUMP_DIAMONDS':
        activeTrumpSuit = 'diamonds';
        logMessages.push(`Rule Shift: Diamonds are TRUMP!`);
        break;

      case 'TRUMP_CLUBS':
        activeTrumpSuit = 'clubs';
        logMessages.push(`Rule Shift: Clubs are TRUMP!`);
        break;

      case 'RANK_BOOST':
        if (isP1) p1RankBonus += 3;
        else p2RankBonus += 3;
        logMessages.push(`${isP1 ? p1.name : p2.name} gains +3 rank bonus!`);
        break;

      case 'TIE_BREAKER':
        if (isP1) p1TieBreaker = true;
        else p2TieBreaker = true;
        logMessages.push(`${isP1 ? p1.name : p2.name} holds the Vanguard's Edge (wins ties)!`);
        break;

      case 'OVERKILL':
        // If this player wins, opponent loses +1 card.
        // But user specified: "the losing player loses an additional card from their hand"
        // If P1 played Overkill and P2 wins, P1 loses 2 cards!
        // We'll apply overkill to whoever ends up losing!
        if (isP1) p2ExtraDiscard += 1;
        else p1ExtraDiscard += 1;
        logMessages.push(`Overkill primed! The losing player will lose an extra card!`);
        break;

      case 'DOUBLE_DOWN':
        if (isP1) {
          p1ExtraDraw += 1;
          p1ExtraDiscard += 1;
        } else {
          p2ExtraDraw += 1;
          p2ExtraDiscard += 1;
        }
        logMessages.push(`${isP1 ? p1.name : p2.name} doubled down! High stakes activated!`);
        break;

      case 'PICKPOCKET':
        if (isP1) p1Pickpocket = true;
        else p2Pickpocket = true;
        logMessages.push(`${isP1 ? p1.name : p2.name} prepared Pickpocket!`);
        break;

      case 'TACTICAL_RETREAT':
        if (isP1) p1TacticalRetreat = true;
        else p2TacticalRetreat = true;
        logMessages.push(`${isP1 ? p1.name : p2.name} prepared Tactical Retreat!`);
        break;
    }
  }

  // Calculate effective ranks
  const p1EffectiveRank = p1BaseRank + p1RankBonus;
  const p2EffectiveRank = p2BaseRank + p2RankBonus;

  let finalWinnerId: string | null = null;
  let isFinalTie = false;

  // 1. Check Trump Suit dominance if active
  if (activeTrumpSuit) {
    const p1IsTrump = p1.card.suit === activeTrumpSuit;
    const p2IsTrump = p2.card.suit === activeTrumpSuit;

    if (p1IsTrump && !p2IsTrump) {
      finalWinnerId = p1.id;
      logMessages.push(`${p1.name}'s ${p1.card.label} of ${p1.card.suit} trumps ${p2.name}'s ${p2.card.label} of ${p2.card.suit}!`);
    } else if (!p1IsTrump && p2IsTrump) {
      finalWinnerId = p2.id;
      logMessages.push(`${p2.name}'s ${p2.card.label} of ${p2.card.suit} trumps ${p1.name}'s ${p1.card.label} of ${p1.card.suit}!`);
    }
  }

  // 2. If no trump winner decided yet, evaluate by rank rules:
  if (!finalWinnerId) {
    if (ruleMedianWins) {
      // Distance from 7
      const p1Dist = Math.abs(p1EffectiveRank - 7);
      const p2Dist = Math.abs(p2EffectiveRank - 7);
      if (p1Dist < p2Dist) {
        finalWinnerId = p1.id;
        logMessages.push(`${p1.name} is closer to 7 (${p1EffectiveRank}, dist ${p1Dist} vs ${p2EffectiveRank}, dist ${p2Dist})!`);
      } else if (p2Dist < p1Dist) {
        finalWinnerId = p2.id;
        logMessages.push(`${p2.name} is closer to 7 (${p2EffectiveRank}, dist ${p2Dist} vs ${p1EffectiveRank}, dist ${p1Dist})!`);
      } else {
        isFinalTie = true;
      }
    } else if (ruleLowestWins) {
      // Lowest rank wins
      if (p1EffectiveRank < p2EffectiveRank) {
        finalWinnerId = p1.id;
        logMessages.push(`Inversion: ${p1.name}'s lower rank ${p1EffectiveRank} beats ${p2EffectiveRank}!`);
      } else if (p2EffectiveRank < p1EffectiveRank) {
        finalWinnerId = p2.id;
        logMessages.push(`Inversion: ${p2.name}'s lower rank ${p2EffectiveRank} beats ${p1EffectiveRank}!`);
      } else {
        isFinalTie = true;
      }
    } else {
      // Standard: Highest rank wins
      if (p1EffectiveRank > p2EffectiveRank) {
        finalWinnerId = p1.id;
        logMessages.push(`${p1.name}'s ${p1EffectiveRank} beats ${p2.name}'s ${p2EffectiveRank}!`);
      } else if (p2EffectiveRank > p1EffectiveRank) {
        finalWinnerId = p2.id;
        logMessages.push(`${p2.name}'s ${p2EffectiveRank} beats ${p1.name}'s ${p1EffectiveRank}!`);
      } else {
        isFinalTie = true;
      }
    }
  }

  // 3. Handle Ties & Tie Breaker modifier
  if (isFinalTie || (!finalWinnerId && !isFinalTie)) {
    if (p1TieBreaker && !p2TieBreaker) {
      finalWinnerId = p1.id;
      isFinalTie = false;
      logMessages.push(`${p1.name} breaks the tie with Vanguard's Edge!`);
    } else if (p2TieBreaker && !p1TieBreaker) {
      finalWinnerId = p2.id;
      isFinalTie = false;
      logMessages.push(`${p2.name} breaks the tie with Vanguard's Edge!`);
    } else {
      isFinalTie = true;
      finalWinnerId = null;
      logMessages.push(`Round ended in a stalemate TIE! Stakes DOUBLE for next round!`);
    }
  }

  return {
    tentativeWinnerId,
    tentativeIsTie,
    firstFlipperId,
    secondFlipperId,
    firstModifier,
    secondModifier,
    firstModifierCancelled,
    secondModifierCancelled,
    firstModifierLog,
    secondModifierLog,
    finalWinnerId,
    isFinalTie,
    p1FinalRank: p1EffectiveRank,
    p2FinalRank: p2EffectiveRank,
    p1ExtraDiscard,
    p2ExtraDiscard,
    p1ExtraDraw,
    p2ExtraDraw,
    p1Pickpocket,
    p2Pickpocket,
    p1TacticalRetreat,
    p2TacticalRetreat,
    logMessages,
  };
}
