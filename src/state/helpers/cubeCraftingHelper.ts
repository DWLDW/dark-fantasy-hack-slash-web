import { GameItem, ItemRarity, RuneWordRecipe, EquipSlot } from '../../types/game';
import { D2_RUNES } from '../../data/runes';
import { RUNEWORD_RECIPES } from '../../data/runeWords';
import { calculateRuneWordItem } from './runeWordCalculator';

export function extractRuneKey(itemOrName: GameItem | string): string {
  const name = typeof itemOrName === 'string' ? itemOrName : itemOrName.name;
  const match = name.match(/\(([A-Za-z]+)\)/);
  if (match && D2_RUNES[match[1]]) return match[1];

  const directMatch = Object.entries(D2_RUNES).find(([_, def]) => def.name === name);
  if (directMatch) return directMatch[0];

  if (typeof itemOrName !== 'string' && itemOrName.id && itemOrName.id.startsWith('rune_')) {
    const keyCandidate = itemOrName.id.replace('rune_', '');
    if (D2_RUNES[keyCandidate]) return keyCandidate;
  }

  return 'El';
}

export function getItemSellPrice(item: GameItem): number {
  const fallback = item.rarity === 'legendary' ? 8000
    : item.rarity === 'unique' ? 4000
    : item.rarity === 'set' ? 2000
    : item.rarity === 'rare' ? 600
    : item.rarity === 'magic' ? 150 : 40;
  const val = item.value || fallback;
  return Math.max(10, Math.floor(val * 0.25));
}

export function bulkSellHelper(
  inventory: GameItem[],
  rarities: ItemRarity[] = ['normal', 'magic']
): { remainingInventory: GameItem[]; soldCount: number; totalGold: number } {
  const targets = inventory.filter(i =>
    rarities.includes(i.rarity) &&
    i.slot !== 'rune' &&
    i.slot !== 'consumable' &&
    !i.isRuneWord
  );
  if (targets.length === 0) {
    return { remainingInventory: inventory, soldCount: 0, totalGold: 0 };
  }

  let totalGold = 0;
  const targetIds = new Set(targets.map(i => i.id));
  targets.forEach(i => {
    totalGold += getItemSellPrice(i);
  });

  return {
    remainingInventory: inventory.filter(i => !targetIds.has(i.id)),
    soldCount: targets.length,
    totalGold
  };
}

export interface SocketRuneResult {
  success: boolean;
  message: string;
  isRuneWord?: boolean;
  runeWordMatch?: RuneWordRecipe;
  updatedItem?: GameItem;
  runeKey?: string;
}

export function socketRuneHelper(
  target: GameItem,
  runeItem: GameItem
): SocketRuneResult {
  if (!target.sockets || (target.socketedRunes && target.socketedRunes.length >= target.sockets)) {
    return { success: false, message: '더 이상 룬을 박을 빈 소켓이 없습니다!' };
  }

  const runeKey = extractRuneKey(runeItem);
  const newSocketed = [...(target.socketedRunes || []), runeKey];

  let isRuneWord = false;
  let runeWordMatch: typeof RUNEWORD_RECIPES[0] | undefined = undefined;

  if (target.rarity === 'normal' && newSocketed.length === target.sockets) {
    runeWordMatch = RUNEWORD_RECIPES.find(rw => {
      const isSlotMatching = rw.allowedSlot === target.slot || (rw.allowedSlot === 'weapon' && (target.slot === 'weapon' || target.slot === 'shield'));
      if (!isSlotMatching || rw.requiredSockets !== target.sockets) return false;
      return rw.requiredRunes.every((r, idx) => r === newSocketed[idx]);
    });

    if (runeWordMatch) {
      isRuneWord = true;
    }
  }

  let updatedItem: GameItem;
  if (isRuneWord && runeWordMatch) {
    updatedItem = calculateRuneWordItem(target, runeWordMatch);
  } else {
    // Apply single rune stat bonus to the socketed item
    const runeDef = D2_RUNES[runeKey];
    const isWeapon = target.slot === 'weapon';
    const bonusStats = runeDef ? (isWeapon ? runeDef.statsWeapon : runeDef.statsArmor) : {};
    
    const newStats = { ...(target.stats || {}) };
    Object.entries(bonusStats).forEach(([k, v]) => {
      const statKey = k as keyof typeof newStats;
      newStats[statKey] = ((newStats[statKey] as number) || 0) + (v as number);
    });

    updatedItem = {
      ...target,
      stats: newStats,
      socketedRunes: newSocketed,
      description: `[소켓 ${newSocketed.length}/${target.sockets} 각인: ${newSocketed.join(', ')}] ${target.baseItemName || target.name}`
    };
  }

  return {
    success: true,
    message: isRuneWord && runeWordMatch
      ? `✨ 고대 룬워드 발동! [${runeWordMatch.name}] 완성!`
      : `[${target.name}]의 소켓에 [${runeKey} 룬]을 장착했습니다.`,
    isRuneWord,
    runeWordMatch,
    updatedItem,
    runeKey
  };
}

export interface CubeTransmuteResult {
  success: boolean;
  message: string;
  consumedItemIds?: string[];
  createdItem?: GameItem;
}

export function cubeTransmuteHelper(selectedItems: GameItem[]): CubeTransmuteResult {
  if (selectedItems.length === 0) {
    return { success: false, message: '큐브에 합성할 재료를 넣으세요.' };
  }

  // Recipe 1: 3 of same Runes -> 1 higher Rune
  if (selectedItems.length === 3 && selectedItems.every(i => i.slot === 'rune' && i.name === selectedItems[0].name)) {
    const rKey = extractRuneKey(selectedItems[0]);

    const runeOrder = [
      'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
      'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem',
      'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber',
      'Jah', 'Cham', 'Zod'
    ];
    const curIdx = rKey ? runeOrder.indexOf(rKey) : -1;

    if (curIdx >= 0 && curIdx < runeOrder.length - 1) {
      const nextKey = runeOrder[curIdx + 1];
      const nextDef = D2_RUNES[nextKey];
      const newRune: GameItem = {
        id: `cube_rune_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: nextDef.name,
        rarity: nextDef.number >= 20 ? 'legendary' : 'rare',
        slot: 'rune',
        stats: {},
        value: nextDef.number * 350,
        icon: 'Sparkles',
        description: `[룬 #${nextDef.number}] 무기: ${nextDef.weaponBonus} / 방어구: ${nextDef.armorBonus}`
      };

      return {
        success: true,
        message: `🔮 호라드릭 큐브 합성 성공! [${newRune.name}]을(를) 연성했습니다!`,
        consumedItemIds: selectedItems.map(i => i.id),
        createdItem: newRune
      };
    }
  }

  // Recipe 2: Normal Item (weapon, armor, helm, shield) + 1 Rune -> Add Sockets
  const socketableSlots: EquipSlot[] = ['weapon', 'armor', 'helm', 'shield'];
  const normalItem = selectedItems.find(i => i.rarity === 'normal' && socketableSlots.includes(i.slot as EquipSlot) && (!i.sockets || i.sockets === 0));
  const hasRune = selectedItems.find(i => i.slot === 'rune');

  if (selectedItems.length === 2 && normalItem && hasRune) {
    const maxSocketsForSlot = normalItem.slot === 'helm' ? 3 : normalItem.slot === 'shield' ? 4 : 4;
    const socketCount = Math.min(maxSocketsForSlot, Math.floor(Math.random() * 2) + 2); // 2 or 3 sockets
    const updated: GameItem = {
      ...normalItem,
      sockets: socketCount,
      socketedRunes: [],
      name: `${normalItem.baseItemName || normalItem.name} (${socketCount} 소켓)`,
      description: `${socketCount}개의 빈 소켓이 뚫린 베이스 아이템. 룬을 박아 룬워드를 제작하세요.`
    };

    return {
      success: true,
      message: `🔮 큐브의 힘으로 [${updated.name}]에 ${socketCount}개의 소켓을 뚫었습니다!`,
      consumedItemIds: selectedItems.map(i => i.id),
      createdItem: updated
    };
  }

  return { success: false, message: '일치하는 호라드릭 큐브 레시피가 없습니다.' };
}

export const POTION_CAPACITY_TIERS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20];
export const POTION_CAPACITY_COSTS = [
  1500, 4000, 10000, 25000, 50000, 100000, 200000, 400000, 800000, 1500000, 3000000, 6000000, 12000000
];

export function getPotionCapacityUpgradeCost(currentLevel: number): number | null {
  if (currentLevel >= POTION_CAPACITY_COSTS.length) return null;
  return POTION_CAPACITY_COSTS[currentLevel];
}

export function getPotionHealingUpgradeCost(currentLevel: number): number | null {
  if (currentLevel >= 30) return null;
  return Math.floor(2000 * Math.pow(1.22, currentLevel));
}

export function getConsumablePowerUpgradeCost(currentLevel: number): number | null {
  if (currentLevel >= 30) return null;
  return Math.floor(2500 * Math.pow(1.22, currentLevel));
}

export function getGambleLevelUpgradeCost(currentLevel: number): number | null {
  if (currentLevel >= 20) return null;
  return Math.floor(5000 * Math.pow(1.35, currentLevel));
}
