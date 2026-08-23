import { GameItem, ItemRarity, RuneWordRecipe } from '../../types/game';
import { D2_RUNES } from '../../data/runes';
import { RUNEWORD_RECIPES } from '../../data/runeWords';
import { calculateRuneWordItem } from './runeWordCalculator';

export function getItemSellPrice(item: GameItem): number {
  if (item.rarity === 'normal') return 5;
  if (item.rarity === 'magic') return 15;
  if (item.rarity === 'rare') return 50;
  if (item.rarity === 'set') return 150;
  if (item.rarity === 'unique') return 300;
  if (item.rarity === 'legendary') return 500;
  if (item.rarity === 'runeword') return 250;
  return item.value || 5;
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

  const runeKey = Object.keys(D2_RUNES).find(k =>
    runeItem.name.includes(k) || runeItem.name.includes(D2_RUNES[k].name.split(' ')[0])
  ) || 'El';

  const newSocketed = [...(target.socketedRunes || []), runeKey];

  let isRuneWord = false;
  let runeWordMatch: typeof RUNEWORD_RECIPES[0] | undefined = undefined;

  if (target.rarity === 'normal' && newSocketed.length === target.sockets) {
    runeWordMatch = RUNEWORD_RECIPES.find(rw => {
      if (rw.allowedSlot !== target.slot || rw.requiredSockets !== target.sockets) return false;
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
    updatedItem = {
      ...target,
      socketedRunes: newSocketed,
      description: `[소켓 ${newSocketed.length}/${target.sockets} 장착: ${newSocketed.join(', ')}] ${target.baseItemName || target.name}`
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
    const runeName = selectedItems[0].name;
    const rKey = Object.keys(D2_RUNES).find(k =>
      runeName.includes(k) || runeName.includes(D2_RUNES[k].name.split(' ')[0])
    );

    const runeOrder = ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Sol', 'Shael', 'Amn', 'Ber', 'Jah'];
    const curIdx = rKey ? runeOrder.indexOf(rKey) : -1;

    if (curIdx >= 0 && curIdx < runeOrder.length - 1) {
      const nextKey = runeOrder[curIdx + 1];
      const nextDef = D2_RUNES[nextKey];
      const newRune: GameItem = {
        id: `cube_rune_${Math.random()}`,
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

  // Recipe 2: Normal Item + 1 Rune -> Add Sockets
  const normalItem = selectedItems.find(i => i.rarity === 'normal' && (!i.sockets || i.sockets === 0));
  const hasRune = selectedItems.find(i => i.slot === 'rune');

  if (selectedItems.length === 2 && normalItem && hasRune) {
    const socketCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 sockets
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
