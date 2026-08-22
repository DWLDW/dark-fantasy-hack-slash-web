import { RUNEWORD_RECIPES, D2_RUNES } from '../data/gameData';
import { RuneWordRecipe } from '../types/game';

export const D2_RUNE_ORDER = [
  'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
  'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Lem', 'Pul', 'Um', 'Mal', 'Ist',
  'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod'
];

export interface RuneCraftSimulation {
  canDirectCraft: boolean;
  canTransmuteCraft: boolean;
  directMissingRunes: string[];
  transmutedRunesCost: Record<string, number>; // How many of each rune would be consumed
}

/**
 * Checks if a recipe can be crafted directly, or through sub-rune synthesis (3:1 conversion).
 */
export function simulateRuneWordCrafting(
  recipe: RuneWordRecipe,
  runesVault: Record<string, number>
): RuneCraftSimulation {
  // Count required runes for this recipe
  const requiredCounts: Record<string, number> = {};
  recipe.requiredRunes.forEach(r => {
    requiredCounts[r] = (requiredCounts[r] || 0) + 1;
  });

  // 1. Direct Craft Check
  let canDirectCraft = true;
  const directMissingRunes: string[] = [];

  Object.entries(requiredCounts).forEach(([rKey, count]) => {
    const owned = runesVault[rKey] || 0;
    if (owned < count) {
      canDirectCraft = false;
      directMissingRunes.push(`${rKey}(${owned}/${count})`);
    }
  });

  // 2. Transmute Craft Simulation (3 sub-runes = 1 higher rune)
  const virtualVault = { ...runesVault };
  let canTransmuteCraft = true;

  // Process required runes from highest rank to lowest rank
  const sortedReqRunes = Object.keys(requiredCounts).sort((a, b) => {
    return D2_RUNE_ORDER.indexOf(b) - D2_RUNE_ORDER.indexOf(a);
  });

  for (const targetRune of sortedReqRunes) {
    const needed = requiredCounts[targetRune];
    const targetIdx = D2_RUNE_ORDER.indexOf(targetRune);
    if (targetIdx < 0) {
      canTransmuteCraft = false;
      break;
    }

    let remainingNeeded = needed;

    // Use directly available in virtual vault first
    const availableDirect = virtualVault[targetRune] || 0;
    const directUsed = Math.min(availableDirect, remainingNeeded);
    virtualVault[targetRune] = availableDirect - directUsed;
    remainingNeeded -= directUsed;

    // If still need more, synthesize from lower runes backwards
    while (remainingNeeded > 0) {
      let synthesizedOne = false;

      // Recursive / back-trace synthesis helper
      const trySynthesize = (currIdx: number): boolean => {
        if (currIdx <= 0) return false;
        const lowerRune = D2_RUNE_ORDER[currIdx - 1];
        
        // If lower rune has at least 3, use them
        if ((virtualVault[lowerRune] || 0) >= 3) {
          virtualVault[lowerRune] -= 3;
          return true;
        }

        // Otherwise try to synthesize 1 lower rune first, until we have 3
        while ((virtualVault[lowerRune] || 0) < 3) {
          const success = trySynthesize(currIdx - 1);
          if (!success) return false;
          virtualVault[lowerRune] = (virtualVault[lowerRune] || 0) + 1;
        }

        virtualVault[lowerRune] -= 3;
        return true;
      };

      if (trySynthesize(targetIdx)) {
        synthesizedOne = true;
        remainingNeeded -= 1;
      } else {
        // Cannot synthesize
        break;
      }
    }

    if (remainingNeeded > 0) {
      canTransmuteCraft = false;
      break;
    }
  }

  // Calculate total consumed runes
  const consumed: Record<string, number> = {};
  if (canTransmuteCraft) {
    Object.keys(runesVault).forEach(k => {
      const diff = (runesVault[k] || 0) - (virtualVault[k] || 0);
      if (diff > 0) {
        consumed[k] = diff;
      }
    });
  }

  return {
    canDirectCraft,
    canTransmuteCraft,
    directMissingRunes,
    transmutedRunesCost: consumed
  };
}
