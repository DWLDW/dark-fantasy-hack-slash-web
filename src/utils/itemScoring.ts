import { GameItem, EquipSlot, ItemStats } from '../types/game';

/**
 * Calculates comprehensive item gear power score based on:
 * - Attack Power & Offensive Stats (min/max dmg, STR, attack speed, crit chance/damage, overkill, lifesteal)
 * - Health, Defense & Survivability (HP, CON, Armor, Shield, Evasion, DR%, All Resist)
 * - Utility, Sockets & Rarity Tiers
 */
export function calculateItemScore(item?: GameItem | null): number {
  if (!item || !item.stats) return 0;
  const s = item.stats;

  // 1. Offensive Power (공격력 가중치)
  const dmgAvg = ((s.minDmg || 0) + (s.maxDmg || 0)) / 2;
  const attackPowerScore =
    dmgAvg * 2.2 +
    (s.str || 0) * 1.6 +
    (s.attackSpeed || 0) * 1.3 +
    (s.critChance || 0) * 1.5 +
    (s.critDamage || 0) * 0.4 +
    (s.overkillEfficiency || 0) * 0.6 +
    (s.lifeSteal || 0) * 1.5;

  // 2. Defensive & Health Power (체력/방어 가중치)
  const healthDefScore =
    (s.hp || 0) * 1.0 +
    (s.con || 0) * 5.0 + // 1 CON gives ~5 HP
    (s.defense || 0) * 1.2 +
    (s.shield || 0) * 1.0 +
    (s.evasion || 0) * 1.8 +
    (s.damageReduction || 0) * 2.5 +
    (s.allResist || 0) * 2.2;

  // 3. Auxiliary Attributes & Magic Find
  const auxScore =
    (s.dex || 0) * 1.2 +
    (s.int || 0) * 0.5 +
    (s.wis || 0) * 0.8 +
    (s.fortune || 0) * 0.5 +
    (s.mana || 0) * 0.2 +
    (item.sockets || 0) * 5;

  // 4. Item Rarity & RuneWord Baseline Bonus
  let rarityBonus = 0;
  switch (item.rarity) {
    case 'legendary':
    case 'unique':
      rarityBonus = 18;
      break;
    case 'runeword':
      rarityBonus = 22;
      break;
    case 'set':
      rarityBonus = 14;
      break;
    case 'rare':
      rarityBonus = 9;
      break;
    case 'magic':
      rarityBonus = 4;
      break;
    default:
      rarityBonus = 0;
  }

  // 5. Sub-Affixes extra score
  let subAffixesScore = 0;
  if (item.subAffixes && item.subAffixes.length > 0) {
    subAffixesScore = item.subAffixes.length * 3;
  }

  return Math.round(attackPowerScore + healthDefScore + auxScore + rarityBonus + subAffixesScore);
}

/**
 * Checks if a candidate item is significantly better than currently equipped item.
 * If score difference is marginal (< 5% difference or < 4 points), keeps current item to avoid jitter.
 */
export function isItemBetterWithThreshold(
  candidate: GameItem,
  current: GameItem | undefined | null,
  thresholdPercent: number = 0.05,
  minScoreDiff: number = 4
): boolean {
  if (!current) return true; // Slot is currently empty
  const candScore = calculateItemScore(candidate);
  const currScore = calculateItemScore(current);

  if (candScore <= currScore) return false;

  const scoreDiff = candScore - currScore;
  const ratio = scoreDiff / Math.max(1, currScore);

  // Require both minimum points diff AND minimum percentage improvement
  return scoreDiff >= minScoreDiff && ratio >= thresholdPercent;
}

export interface AutoEquipPlanResult {
  hasUpgrades: boolean;
  equippedCount: number;
  replacedSlots: {
    slot: EquipSlot;
    oldItem?: GameItem;
    newItem: GameItem;
    oldScore: number;
    newScore: number;
    scoreDiff: number;
  }[];
  newEquipment: Partial<Record<EquipSlot, GameItem>>;
  remainingInventory: GameItem[];
}

/**
 * Finds the optimal auto-equipment plan across all 9 equipment slots.
 */
export function findBestEquipmentPlan(
  inventory: GameItem[],
  currentEquipment: Partial<Record<EquipSlot, GameItem>>,
  playerLevel: number
): AutoEquipPlanResult {
  const resultEquipment: Partial<Record<EquipSlot, GameItem>> = { ...currentEquipment };
  let currentInvPool = [...inventory];
  const replacedSlots: AutoEquipPlanResult['replacedSlots'] = [];

  // Filter valid equippable identified items matching player level
  const isEquippableCandidate = (item: GameItem) =>
    item.isIdentified !== false &&
    (!item.requiredLevel || playerLevel >= item.requiredLevel);

  // Single-slot equipment types
  const singleSlots: EquipSlot[] = ['weapon', 'shield', 'helm', 'armor', 'gloves', 'boots', 'amulet'];

  for (const slot of singleSlots) {
    const currentItem = resultEquipment[slot];
    const candidates = currentInvPool.filter(
      i => (i.slot === slot || (slot === 'weapon' && i.slot === 'weapon')) && isEquippableCandidate(i)
    );

    if (candidates.length === 0) continue;

    // Sort candidates by score descending
    candidates.sort((a, b) => calculateItemScore(b) - calculateItemScore(a));
    const bestCandidate = candidates[0];

    if (isItemBetterWithThreshold(bestCandidate, currentItem)) {
      const oldScore = calculateItemScore(currentItem);
      const newScore = calculateItemScore(bestCandidate);
      
      replacedSlots.push({
        slot,
        oldItem: currentItem,
        newItem: bestCandidate,
        oldScore,
        newScore,
        scoreDiff: newScore - oldScore
      });

      resultEquipment[slot] = bestCandidate;
      // Remove candidate from inventory pool and return old equipped item to inventory pool
      currentInvPool = currentInvPool.filter(i => i.id !== bestCandidate.id);
      if (currentItem) {
        currentInvPool.push(currentItem);
      }
    }
  }

  // Dual Ring Slots handling (ring1, ring2)
  const ringCandidates = currentInvPool.filter(
    i => (i.slot === 'ring' || i.slot === 'ring1' || i.slot === 'ring2') && isEquippableCandidate(i)
  );

  const ringSlots: EquipSlot[] = ['ring1', 'ring2'];
  for (const rSlot of ringSlots) {
    const currentRing = resultEquipment[rSlot];
    if (ringCandidates.length === 0) continue;

    ringCandidates.sort((a, b) => calculateItemScore(b) - calculateItemScore(a));
    const bestRing = ringCandidates[0];

    if (isItemBetterWithThreshold(bestRing, currentRing)) {
      const oldScore = calculateItemScore(currentRing);
      const newScore = calculateItemScore(bestRing);

      replacedSlots.push({
        slot: rSlot,
        oldItem: currentRing,
        newItem: bestRing,
        oldScore,
        newScore,
        scoreDiff: newScore - oldScore
      });

      resultEquipment[rSlot] = bestRing;
      currentInvPool = currentInvPool.filter(i => i.id !== bestRing.id);
      const idxInRingCand = ringCandidates.findIndex(i => i.id === bestRing.id);
      if (idxInRingCand >= 0) ringCandidates.splice(idxInRingCand, 1);
      if (currentRing) {
        currentInvPool.push(currentRing);
        ringCandidates.push(currentRing);
      }
    }
  }

  return {
    hasUpgrades: replacedSlots.length > 0,
    equippedCount: replacedSlots.length,
    replacedSlots,
    newEquipment: resultEquipment,
    remainingInventory: currentInvPool
  };
}
