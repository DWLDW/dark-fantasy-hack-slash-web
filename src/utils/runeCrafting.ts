import { RUNEWORD_RECIPES, D2_RUNES, D2_RUNE_ORDER } from '../data/gameData';
import { RuneWordRecipe } from '../types/game';

// D2_RUNE_ORDER is now single-sourced from src/data/runes.ts via gameData re-export

export interface RuneCraftSimulation {
  canDirectCraft: boolean;
  canTransmuteCraft: boolean;
  directMissingRunes: string[];
  transmutedRunesCost: Record<string, number>;
}

export function simulateRuneWordCrafting(
  recipe: RuneWordRecipe,
  runesVault: Record<string, number>
): RuneCraftSimulation {
  const requiredCounts: Record<string, number> = {};
  recipe.requiredRunes.forEach(r => {
    requiredCounts[r] = (requiredCounts[r] || 0) + 1;
  });

  let canDirectCraft = true;
  const directMissingRunes: string[] = [];

  Object.entries(requiredCounts).forEach(([rKey, count]) => {
    const owned = runesVault[rKey] || 0;
    if (owned < count) {
      canDirectCraft = false;
      directMissingRunes.push(`${rKey}(${owned}/${count})`);
    }
  });

  const virtualVault = { ...runesVault };
  let canTransmuteCraft = true;

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
    const availableDirect = virtualVault[targetRune] || 0;
    const directUsed = Math.min(availableDirect, remainingNeeded);
    virtualVault[targetRune] = availableDirect - directUsed;
    remainingNeeded -= directUsed;

    while (remainingNeeded > 0) {
      const trySynthesize = (currIdx: number): boolean => {
        if (currIdx <= 0) return false;
        const lowerRune = D2_RUNE_ORDER[currIdx - 1];
        if ((virtualVault[lowerRune] || 0) >= 3) {
          virtualVault[lowerRune] -= 3;
          return true;
        }
        while ((virtualVault[lowerRune] || 0) < 3) {
          const success = trySynthesize(currIdx - 1);
          if (!success) return false;
          virtualVault[lowerRune] = (virtualVault[lowerRune] || 0) + 1;
        }
        virtualVault[lowerRune] -= 3;
        return true;
      };

      if (trySynthesize(targetIdx)) {
        remainingNeeded -= 1;
      } else {
        break;
      }
    }

    if (remainingNeeded > 0) {
      canTransmuteCraft = false;
      break;
    }
  }

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
