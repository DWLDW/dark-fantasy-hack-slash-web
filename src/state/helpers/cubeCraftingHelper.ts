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
      (newStats as any)[statKey] = ((newStats[statKey] as number) || 0) + (v as number);
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

  // 🔒 Locked Item Protection
  if (selectedItems.some(i => i.isLocked)) {
    return { success: false, message: '🔒 잠금된 아이템은 큐브 합성 재료로 사용할 수 없습니다.' };
  }

  // Recipe 1: 3 of same Rarity equipment -> 1 higher Rarity item (Classic D2 Cube Recipe)
  if (selectedItems.length === 3) {
    const r0 = selectedItems[0].rarity;
    if (selectedItems.every(i => i.rarity === r0)) {
      let targetRarity: ItemRarity = 'magic';
      if (r0 === 'normal') targetRarity = 'magic';
      else if (r0 === 'magic') targetRarity = 'rare';
      else if (r0 === 'rare') targetRarity = 'unique';

      const baseItem = selectedItems[0];
      const newItem: GameItem = {
        ...baseItem,
        id: `cube_craft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `연성된 [${baseItem.baseItemName || baseItem.name}]`,
        rarity: targetRarity,
        isIdentified: false,
        value: Math.floor(selectedItems.reduce((s, i) => s + (i.value || 50), 0) * 0.8),
        description: `호라드릭 큐브의 비전 연성으로 합성된 ${targetRarity.toUpperCase()} 등급 장비입니다. 데커드 케인에게 감정받으세요.`
      };

      return {
        success: true,
        message: `🔮 호라드릭 큐브 연성 성공! [${newItem.name}] (${targetRarity.toUpperCase()})을(를) 획득했습니다! (식별 필요)`,
        consumedItemIds: selectedItems.map(i => i.id),
        createdItem: newItem
      };
    }
  }

  // Recipe 2: Single Normal Item -> Add Sockets (D2 Matrix: Weapon 1~6, Armor/Shield 1~4, Helm 1~3)
  const socketableSlots: EquipSlot[] = ['weapon', 'armor', 'helm', 'shield'];
  if (selectedItems.length === 1 && selectedItems[0].rarity === 'normal' && socketableSlots.includes(selectedItems[0].slot as EquipSlot) && (!selectedItems[0].sockets || selectedItems[0].sockets === 0)) {
    const target = selectedItems[0];
    const maxSockets = target.slot === 'weapon'
      ? (target.tier === 'elite' ? 6 : target.tier === 'exceptional' ? 5 : 4)
      : target.slot === 'helm'
      ? 3
      : 4;
    // 1부터 maxSockets 사이의 랜덤 소켓 생성 (D2 큐빙 확률)
    const socketCount = Math.floor(Math.random() * maxSockets) + 1;
    const updated: GameItem = {
      ...target,
      sockets: socketCount,
      socketedRunes: [],
      name: `${target.baseItemName || target.name} (${socketCount} 소켓)`,
      description: `${socketCount}개의 빈 소켓이 뚫린 노멀 베이스 아이템. 룬을 순서대로 박아 룬워드를 제작하세요.`
    };

    return {
      success: true,
      message: `🔮 호라드릭 큐브의 힘으로 [${updated.name}]에 ${socketCount}개의 소켓을 뚫었습니다!`,
      consumedItemIds: [target.id],
      createdItem: updated
    };
  }

  return { success: false, message: '일치하는 호라드릭 큐브 레시피가 없습니다. (동일 등급 장비 3개 또는 노말 소켓 베이스 1개 필요)' };
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
